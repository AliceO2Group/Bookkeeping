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
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const buildEndpoints = require('./routers');
const { JwtConfig } = require('../config');

/**
 * WebUI implementation of the Server.
 */
class WebUiServer {
    /**
     * Creates a new `WebUi Server` instance.
     */
    constructor() {
        this.acceptIncomingConnectionsFlag = true;

        this.http = new HttpServer({
            port: 4000,
            autoListen: false,
        }, JwtConfig);

        this.http.addStaticPath(path.resolve(__dirname, '..', 'public'));

        [
            this.http.router,
            this.http.routerPublic,
            this.http.routerStatics,
        ].forEach((router) => router.use((request, response, next) => {
            if (this.isAcceptingIncomingConnections()) {
                next();
                return;
            }

            response.status(503).json({
                errors: [
                    {
                        status: '503',
                        title: 'Service Unavailable',
                        detail: 'This server is shutting down.',
                    },
                ],
            });
        }));

        buildEndpoints(this.http);

        const swaggerDocumentPath = path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml');
        const swaggerDocument = yaml.safeLoad(fs.readFileSync(swaggerDocumentPath));
        this.http.routerStatics.use('/api-docs', swaggerUi.serve);
        this.http.routerStatics.get('/api-docs', swaggerUi.setup(swaggerDocument));
    }

    /**
     * Returns wether or not to accept any new incoming connections.
     *
     * @returns {Boolean} Wether or not to accept any new incoming connections.
     */
    isAcceptingIncomingConnections() {
        return this.acceptIncomingConnectionsFlag;
    }

    /**
     * Sets wether or not to accept any new incoming connections.
     *
     * @param {Boolean} shouldAccept Wether or not to accept any new incoming connections.
     * @returns {Boolean} Wether or not to accept any new incoming connections.
     */
    acceptIncomingConnections(shouldAccept) {
        this.acceptIncomingConnectionsFlag = shouldAccept;
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
        return this.http.close();
    }

    /**
     * Start a server listening for connections.
     *
     * @returns {Promise} Promise object represents ...
     */
    async listen() {
        this.acceptIncomingConnectionsFlag = true;
        return this.http.listen();
    }
}

module.exports = new WebUiServer();
