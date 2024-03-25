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
const helmet = require('helmet');

const { Logger } = require('../utilities');
const { OpenIdConfig, JwtConfig } = require('../config');
const { HttpServer } = require('@aliceo2/web-ui');
const path = require('path');
const buildEndpoints = require('./routers');
const { BkpRoles } = require('../domain/enums/BkpRoles.js');
const { isInTestMode, isInDevMode } = require('../utilities/env-utils');
const { createOrUpdateUser } = require('./services/user/createOrUpdateUser.js');
const { createServer: createViteServer } = require('vite');
const fs = require('fs');
const express = require('express');

/**
 * WebUI implementation of the Server.
 */
class WebUiServer {
    /**
     * Creates a new `WebUi Server` instance.
     */
    constructor() {
        this.logger = Logger('HTTP');

        if (!OpenIdConfig.isValid()) {
            this.logger.info('Missing OpenID configuration');
        }

        const viteOrigin = 'localhost:5173';

        /**
         * @type HttpServer
         */
        this.http = new HttpServer({
            port: 4000,
            autoListen: false,
            vite: [`http://${viteOrigin}`, `ws://${viteOrigin}`],
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

                const user = await createOrUpdateUser(request.session);
                if (request.session.access) {
                    user.access = request.session.access;
                }
                if (request.session.username) {
                    user.username = request.session.username;
                }

                if (isInTestMode() && request.query?.token) {
                    user.access = user.access ?? request.query.token === 'admin' ? [BkpRoles.ADMIN] : [BkpRoles.GUEST];
                }
                request.session = user;
                next();
            });
        });

        if (isInDevMode()) {
            this.http.app.engine('html', require('ejs').renderFile);
            this.http.addStaticPath(path.resolve(__dirname, '..', 'public', 'assets'), 'assets');
            this.http.routerStatics.get('/', (_req, res) => {
                const { NODE_ENV } = process.env;
                res.render(path.resolve(__dirname, '..', 'public', 'index.html'), { NODE_ENV });
                res.send();
            });
        } else {
            this.http.addStaticPath(path.resolve(__dirname, '..', 'public', 'assets'), 'assets');
            this.http.addStaticPath(path.resolve(__dirname, '..', 'public', 'dist'));
        }

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
        this.logger.info('Stopping...');

        try {
            await this.http.close();
        } catch (error) {
            this.logger.error(`Error while stopping: ${error}`);
            return Promise.reject(error);
        }

        this.logger.info('Stopped');
    }

    /**
     * Start a server listening for connections.
     *
     * @returns {Promise} Promise object represents ...
     */
    async listen() {
        this.logger.info('Starting...');

        try {
            await this.http.listen();
        } catch (error) {
            this.logger.error(`Error while starting: ${error}`);
            return Promise.reject(error);
        }

        this.logger.info('Started');
    }
}

exports.WebUiServer = WebUiServer;
