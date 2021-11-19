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
    tables: {
        RunTags,
    },

    utilities: {
        QueryBuilder,
    },
} = require('..');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the RunTagsRepository.
 */
class RunTagsRepository extends Repository {
    /**
     * Creates a new `RunTagsRepository` instance.
     */
    constructor() {
        super(RunTags);
    }

    /**
     * Returns run tag rows by grouping them by run id
     *
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full data
     */
    async findAllAndGroup(queryBuilder = new QueryBuilder()) {
        const result = await this.findAll(queryBuilder);

        const groupedResult = result.reduce((accumulator, currentValue) => {
            if (accumulator[currentValue.runId]) {
                accumulator[currentValue.runId].push(currentValue.tagId);
            } else {
                accumulator[currentValue.runId] = [currentValue.tagId];
            }
            return accumulator;
        }, {});

        return Object.entries(groupedResult).map(([key, value]) => ({ runId: key, tagIds: value }));
    }

    /**
     * Remove all tags & runs relations by run id
     * @param {number} runId  - run ID to delete tags for
     * @return {Promise<void>} - delete result
     */
    async removeById(runId) {
        return await RunTags.sequelize.getQueryInterface().bulkDelete('run_tags', { run_id: runId });
    }

    /**
     * Update run tags by runNumber
     * @param {Array} entities - Tags & runId to associate
     * @return {*} Result of updating
     */
    async updateMany(entities) {
        return await RunTags.bulkCreate(entities, { returning: true });
    }
}

module.exports = new RunTagsRepository();
