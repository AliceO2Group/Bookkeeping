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

const IRepository = require('../../application/interfaces/repositories');
const { LogAdapter } = require('../adapters');
const { models: { Log } } = require('../');

/**
 * LogRepository
 */
class SLogRepository extends IRepository.LogRepository {
    /**
     * Returns all entities.
     *
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAll() {
        const persistenceResults = await Log.findAll();
        return Promise.resolve(LogAdapter.toDomain(persistenceResults));
    }
}

module.exports = new SLogRepository();
