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

const fs = require('fs');
const path = require('path');
const { HttpServer } = require('@aliceo2/web-ui');
const buildEndpoints = require('./routers');
const { JwtConfig } = require('../config');
const { Logger } = require('../utilities');

/**
 * WebUI implementation of the Server.
 */
class WebUiServer {
    /**
     * Creates a new `WebUi Server` instance.
     */
    constructor() {
        this.logger = Logger('HTTP');

        this.http = new HttpServer({
            port: 4000,
            autoListen: false,
        }, JwtConfig);

        this.http.addStaticPath(path.resolve(__dirname, '..', 'public'));
        buildEndpoints(this.http);

        if (process.env.NODE_ENV === 'development') {
            const swaggerUi = require('swagger-ui-express');
            const yaml = require('js-yaml');

            const swaggerDocumentPath = path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml');
            const swaggerDocument = yaml.safeLoad(fs.readFileSync(swaggerDocumentPath));
            this.http.routerStatics.use('/api-docs', swaggerUi.serve);
            this.http.routerStatics.get('/api-docs', swaggerUi.setup(swaggerDocument));
        }
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

module.exports = new WebUiServer();
