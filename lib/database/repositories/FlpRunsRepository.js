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

const { FlpRunsAdapter } = require('../adapters');
const {
    tables: {
        FlpRuns,
    },
    utilities: {
        QueryBuilder,
    },
} = require('..');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the FlpRunsRepository.
 */
class FlpRunsRepository extends Repository {
    /**
     * Creates a new `FlpRunsRepository` instance.
     */
    constructor() {
        super(FlpRuns);
    }

    /**
     * Returns flp tag rows by grouping them by flp id
     *
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full data
     */
    async findAllAndGroup(queryBuilder = new QueryBuilder()) {
        const result = await this.findAll(queryBuilder);

        const groupedResult = result.reduce((accumulator, currentValue) => {
            if (accumulator[currentValue.flpId]) {
                accumulator[currentValue.flpId].push(currentValue.runId);
            } else {
                accumulator[currentValue.flpId] = [currentValue.runId];
            }
            return accumulator;
        }, {});

        return Object.entries(groupedResult).map(([key, value]) => ({ flpId: key, runIds: value }));
    }

    /**
     * Bulk insert entities.
     *
     * @param {Array} entities List of entities to insert.
     * @returns {Promise} Promise object represents the recently inserted FlpTags.
     */
    async bulkInsert(entities) {
        const results = await FlpRuns.bulkCreate(entities.map(FlpRunsAdapter.toDatabase), { returning: true });
        return results.map(FlpRunsAdapter.toEntity);
    }
}

module.exports = new FlpRunsRepository();
