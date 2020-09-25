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

const { LogRunsAdapter } = require('../adapters');
const {
    tables: {
        LogRuns,
    },
} = require('..');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the LogRunsRepository.
 */
class LogRunsRepository extends Repository {
    /**
     * Creates a new `LogRunsRepository` instance.
     */
    constructor() {
        super(LogRuns);
    }

    /**
     * Bulk insert entities.
     *
     * @param {Array} entities List of entities to insert.
     * @returns {Promise} Promise object represents the just inserted run numbers.
     */
    async bulkInsert(entities) {
        entities = Array.isArray(entities) ? entities : [entities];

        const results = await LogRuns.bulkCreate(entities.map(LogRunsAdapter.toDatabase), { returning: true });
        return results.map(LogRunsAdapter.toEntity);
    }
}

module.exports = new LogRunsRepository();
