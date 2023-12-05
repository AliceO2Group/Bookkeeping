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

const { models: { Log }, sequelize, utilities: { QueryBuilder } } = require('../');
const Repository = require('./Repository');
const { timestampToMysql } = require('../../server/utilities/timestampToMysql.js');

/**
 * Return the query to fetch tags count for logs created in a given period
 *
 * @param {Period} the period in which logs should have been created
 * @return {string} the query
 */
const getTagDistributionQuery = ({ from, to }) => sequelize.query(`
    SELECT t.text tag, COUNT(*) count
    FROM logs l
             INNER JOIN log_tags lt on l.id = lt.log_id
             INNER JOIN tags t on lt.tag_id = t.id
    WHERE l.created_at >= :fromTimeStamp
      AND l.created_at < :toTimeStamp
      AND t.archived_at IS NULL
    GROUP BY t.text
    ORDER BY COUNT(*) DESC, t.text
`, {
    replacements: { fromTimeStamp: timestampToMysql(from), toTimeStamp: timestampToMysql(to) },
});

/**
 * Returns the query to fetch a log's reply count for a given parent log id.
 *
 * @param {number} parentLogId The parent log id for which the reply count will be fetced.
 * @returns {Promise<Array<{ reply_count: number }>>} A promise resolving to an array of objects,
 * each containing the reply count for the given parent log id.
 */
const getLogsWithReplyCountQuery = (parentLogId) => sequelize.query(`
    WITH RECURSIVE reply_tree AS (
        SELECT id, parent_log_id
        FROM logs
        WHERE parent_log_id = :parentLogId
        UNION ALL
        SELECT logs.id, logs.parent_log_id
        FROM logs
        JOIN reply_tree ON logs.parent_log_id = reply_tree.id
    )
    SELECT COUNT(*) AS reply_count FROM reply_tree;
`, {
    replacements: { parentLogId },
});

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
     * Adds a 'replies' property to the given rows array which denotes the amount of children for each applicable log.
     *
     * @param {Array} rows The collection of log rows already fetched.
     * @returns {Promise} Promise returning logs with a 'replies' property, denoting the reply count for each log.
     */
    async addChildrenCountByLog(rows) {
        const logIds = [...new Set(rows.map((row) => row.id))];

        for (const logId of logIds) {
            const [result] = await getLogsWithReplyCountQuery(logId);
            const count = result[0].reply_count || 0;

            const rowToAttachTo = rows.find(({ id }) => id === logId);
            if (rowToAttachTo) {
                rowToAttachTo.replies = count;
            }
        }

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

    /**
     * Returns the list of tags and their occurrences in the logs created in the given period
     *
     * @param {Period} period the period of log creation
     * @return {Promise<{tag: string, count: number}[]>} the tag and their amount
     */
    async getTagDistribution(period) {
        return [getTagDistributionQuery(period)];
    }
}

module.exports = new LogRepository();
