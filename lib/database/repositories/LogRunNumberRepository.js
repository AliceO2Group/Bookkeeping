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
     * Insert run number.
     *
     * @param {String} Run number to insert.
     * @returns {Promise} Promise object represents the recently inserted LogRuns.
     */
    async insert(runNumber) {
        const databaseObj = LogRunsAdapter.toDatabase(runNumber);

        const results = await LogRuns.create(databaseObj, { returning: true });

        return LogRunsAdapter.toEntity(results);
    }
}

module.exports = new LogRunsRepository();
