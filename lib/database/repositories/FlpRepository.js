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
    models: {
        FlpRoles,
    },
    utilities: {
        QueryBuilder,
    },
} = require('../');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the FlpRepository.
 */
class FlpRepository extends Repository {
    /**
     * Creates a new `FlpRepository` instance.
     */
    constructor() {
        super(FlpRoles);
    }

    /**
     * Adds a count of root flp by their amount of children onto every applicable flp.
     *
     * @param {Array} rows The collection of rows already fetched
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async addChildrenCountByRootFlp(rows, queryBuilder = new QueryBuilder()) {
        const rootFlpIds = [...new Set(rows.map((row) => row.rootFlpId))];
        queryBuilder
            .where('rootFlpId').oneOf(...rootFlpIds)
            .set('group', ['rootFlpId']);

        const replies = await this.count(queryBuilder);
        replies.forEach(({ rootFlpId, count }) => {
            const rowToAttachTo = rows.find(({ id }) => id === rootFlpId);
            if (rowToAttachTo) {
                rowToAttachTo.replies = count;
            }
        });

        return rows;
    }

    /**
     * Returns all entities.
     *
     * @param {Object} runId The QueryBuilder to use.
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAllByRunId(runId, queryBuilder = new QueryBuilder()) {
        queryBuilder
            .setModel(FlpRoles)
            .whereAssociation('runs', 'id').is(runId);

        return this.findAll(queryBuilder);
    }
}

module.exports = new FlpRepository();
