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

const {
    DatabaseConfig: {
        host,
        port,
    } } = require('../../../lib/config');
const database = require('../../database');

/**
 * Database status use case
 */
class GetDatabaseStatusUseCase {
    /**
     * Executes this use case.
     *
     * @returns {Object} Object that represents the information/status of the server.
     */
    async execute() {
        const connectivity = await database.ping();
        if (connectivity) {
            return {
                host: host,
                port: port,
                status: {
                    ok: true,
                    configured: true,
                },
            };
        }
        return {
            host: host,
            port: port,
            status: {
                ok: false,
                configured: true,
            },
        };
    }
}

module.exports = GetDatabaseStatusUseCase;
