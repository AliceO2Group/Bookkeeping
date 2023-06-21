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
const { logAdapter } = require('../adapters');

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
     * Adds an array of reply logs onto every applicable log.
     * @param {Array} rows - The collection of rows already fetched.
     * @returns {Promise<Array>} - A promise that resolves to an array of log objects with their reply logs.
     */
    async addReplyLogsByRootLog(rows) {
        /**
         * Filters the rows to get the top-level logs (logs without a parentLogId).
         * @param {Object} log - The log object.
         * @returns {boolean} - Returns true if the log is a top-level log.
         */
        const filterTopLevelLogs = (log) => !log.parentLogId;

        /**
         * Retrieves reply logs for a given root log.
         * @param {Object} log - The root log object.
         * @returns {Promise<Object>} - A promise that resolves to the log object with its reply logs.
         */
        const getReplyLogs = async (log) => {
            const replyLogs = await this.findAll({ where: { rootLogId: log.id } });
            const logWithReplyLogs = {
                ...logAdapter.toEntity(log),
            };

            logWithReplyLogs.replyLogs = replyLogs.map(logAdapter.toEntity);

            return logWithReplyLogs;
        };

        const topLevelLogs = rows.filter(filterTopLevelLogs);
        return Promise.all(topLevelLogs.map(getReplyLogs));
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
