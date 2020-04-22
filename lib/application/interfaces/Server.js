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

/**
 * Server
 */
class Server {
    /**
     * Returns the bound address, the address family name, and port of the server.
     *
     * @returns {Object} Object represents the bound address, the address family name, and port of the server.
     */
    address() {
        throw new Error('The method or operation is not implemented.');
    }

    /**
     * Stops the server from accepting new connections and keeps existing connections.
     *
     * @returns {Promise} Promise object represents ...
     */
    async close() {
        return Promise.reject('The method or operation is not implemented.');
    }

    /**
     * Start a server listening for connections.
     *
     * @returns {Promise} Promise object represents ...
     */
    async listen() {
        return Promise.reject('The method or operation is not implemented.');
    }
}

module.exports = Server;
