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
        Log,
    },
    utilities: {
        QueryBuilder,
    },
} = require('../');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the LogRepository.
 */
class LogRepository extends Repository {
    /**
     * Creates a new `LogRepository` instance.
     */
    constructor() {
        super(Log);
    }

    /**
     * Adds a count of root log by their amount of children onto every applicable log.
     *
     * @param {Array} rows The collection of rows already fetched
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async addChildrenCountByRootLog(rows, queryBuilder = new QueryBuilder()) {
        const rootLogIds = [...new Set(rows.map((row) => row.rootLogId))];
        queryBuilder
            .where('rootLogId').oneOf(...rootLogIds)
            .set('group', ['rootLogId']);

        const replies = await this.count(queryBuilder);
        replies.forEach(({ rootLogId, count }) => {
            const rowToAttachTo = rows.find(({ id }) => id === rootLogId);
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
            .setModel(Log)
            .include('user')
            .include('tags')
            .whereAssociation('runs', 'id').is(runId);

        return this.findAll(queryBuilder);
    }

    /**
     * Returns all entities.
     *
     * @param {Object} subsystemId The QueryBuilder to use.
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAllBySubsystemId(subsystemId, queryBuilder = new QueryBuilder()) {
        queryBuilder
            .setModel(Log)
            .include('user')
            .include('tags')
            .whereAssociation('subsystems', 'id').is(subsystemId);

        return this.findAll(queryBuilder);
    }
}

module.exports = new LogRepository();
