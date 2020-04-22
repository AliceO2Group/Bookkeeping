/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const path = require('path');
const { HttpServer } = require('@aliceo2/web-ui');
const { Server } = require('../../application/interfaces');
const buildEndpoints = require('./routers');

/**
 * WebUI implementation of Server.
 */
class WebServer extends Server {
    /**
     * Creates a new WebServer.
     */
    constructor() {
        super();

        this.http = new HttpServer({
            port: 4000,
            autoListen: false,
        });

        this.http.addStaticPath(path.resolve(__dirname, '..', '..', 'public'));
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
        return this.http.close();
    }

    /**
     * Start a server listening for connections.
     *
     * @returns {Promise} Promise object represents ...
     */
    async listen() {
        return this.http.listen();
    }
}

module.exports = WebServer;
