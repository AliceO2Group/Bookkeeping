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
    utilities: {
        QueryBuilder,
    },
} = require('..');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the LogTagsRepository.
 */
class LogRunsRepository extends Repository {
    /**
     * Creates a new `LogTagsRepository` instance.
     */
    constructor() {
        super(LogRuns);
    }

    /**
     * Returns log tag rows by grouping them by log id
     *
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full data
     */
    async findAllAndGroup(queryBuilder = new QueryBuilder()) {
        const result = await this.findAll(queryBuilder);

        const groupedResult = result.reduce((accumulator, currentValue) => {
            if (accumulator[currentValue.logId]) {
                accumulator[currentValue.logId].push(currentValue.runId);
            } else {
                accumulator[currentValue.logId] = [currentValue.runId];
            }
            return accumulator;
        }, {});

        return Object.entries(groupedResult).map(([key, value]) => ({ logId: key, runIds: value }));
    }

    /**
     * Bulk insert entities.
     *
     * @param {Array} entities List of entities to insert.
     * @returns {Promise} Promise object represents the recently inserted LogTags.
     */
    async bulkInsert(entities) {
        const results = await LogRuns.bulkCreate(entities.map(LogRunsAdapter.toDatabase), { returning: true });
        return results.map(LogRunsAdapter.toEntity);
    }
}

module.exports = new LogRunsRepository();
