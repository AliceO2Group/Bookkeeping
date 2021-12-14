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

/**
 * Yess
 */
class GetDatabaseStatusUseCase {
    /**
     * Executes this use case.
     *
     * @returns {Promise} Promise object represents the result of this use case.
     */
    execute() {
        const guiStatus = {
            host: host,
            port: port,
            status: {
                ok: true,
                configured: true,
            },
        };
        return guiStatus;
    }
}

module.exports = GetDatabaseStatusUseCase;
