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

const { version } = require('../../../../package.json');
const database = require('../../../database');
const { DatabaseConfig: { host: databaseHost, port: databasePort } } = require('../../../config/index.js');

/**
 * Service to read the status of the application and of its database
 */
class StatusService {
    /**
     * Return the status of the Bookkeeping application
     *
     * @param {object} server the address on which the application received the request
     * @param {string} server.host the host
     * @param {number} server.port the port
     * @return {{host: string, port: number, version: string, status: {ok: boolean, configured: boolean}}} the application status
     */
    getGuiStatus({ host, port }) {
        return {
            host,
            port,
            version,
            status: {
                ok: true,
                configured: true,
            },
        };
    }

    /**
     * Return the status of the database connection
     *
     * @return {Promise<{host: string, port: number, status: {ok: boolean, configured: boolean}}>} the database status
     */
    async getDatabaseStatus() {
        return {
            host: databaseHost,
            port: databasePort,
            status: {
                ok: Boolean(await database.ping()),
                configured: true,
            },
        };
    }
}

exports.StatusService = StatusService;

exports.statusService = new StatusService();
