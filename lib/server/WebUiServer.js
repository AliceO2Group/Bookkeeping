/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { OpenIdConfig, JwtConfig } = require('../config');
const { HttpServer } = require('@aliceo2/web-ui');
const path = require('path');
const buildEndpoints = require('./routers');
const { isInTestMode } = require('../utilities/env-utils');
const { createOrUpdateUser } = require('./services/user/createOrUpdateUser.js');
const { LogManager } = require('@aliceo2/web-ui');

/**
 * WebUI implementation of the Server.
 */
class WebUiServer {
    /**
     * Creates a new `WebUi Server` instance.
     */
    constructor() {
        this._logger = LogManager.getLogger('HTTP');

        if (!OpenIdConfig.isValid()) {
            this._logger.infoMessage('Missing OpenID configuration');
        }

        /**
         * @type HttpServer
         */
        this.http = new HttpServer({
            port: 4000,
            autoListen: false,
        }, JwtConfig, OpenIdConfig.isValid() ? OpenIdConfig : null);

        [this.http.router, this.http.routerPublic, this.http.routerStatics].forEach((router) => {
            router.use(async (request, response, next) => {
                if (isInTestMode()) {
                    request.session = request.session ?? {
                        personid: 1,
                        id: 1,
                        name: 'John Doe',
                    };
                }

                if (!request.session || isNaN(request.session.personid)) {
                    next();
                    return;
                }

                let user;
                try {
                    user = await createOrUpdateUser(request.session);
                } catch (e) {
                    next(e);
                    return;
                }

                if (request.session.access) {
                    user.access = request.session.access;
                }
                if (request.session.username) {
                    user.username = request.session.username;
                }

                if (isInTestMode() && request.query?.token) {
                    user.access = user.access ?? request.query.token.split(',');
                }
                request.session = user;
                next();
            });
        });

        this.http.addStaticPath(path.resolve(__dirname, '..', 'public'));
        buildEndpoints(this.http);
    }

    /**
     * Returns the bound address, the address family name, and port of the server.
     *
     * @returns {Object} Object represents the bound address, the address family name, and port of the server.
     */
    address() {
        return this.http.address();
    }

    /**
     * Stops the server from accepting new connections and keeps existing connections.
     *
     * @returns {Promise} Promise object represents ...
     */
    async close() {
        this._logger.infoMessage('Stopping...');

        try {
            await this.http.close();
        } catch (error) {
            this._logger.errorMessage(`Error while stopping: ${error}`);
            return Promise.reject(error);
        }

        this._logger.infoMessage('Stopped');
    }

    /**
     * Start a server listening for connections.
     *
     * @returns {Promise} Promise object represents ...
     */
    async listen() {
        this._logger.infoMessage('Starting...');

        try {
            await this.http.listen();
        } catch (error) {
            this._logger.errorMessage(`Error while starting: ${error}`);
            return Promise.reject(error);
        }

        this._logger.infoMessage('Started');
    }
}

exports.WebUiServer = WebUiServer;
