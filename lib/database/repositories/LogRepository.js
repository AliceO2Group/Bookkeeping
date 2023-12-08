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
 * Returns the query to fetch the reply count for a given array of logIds.
 *
 * @param {Array<number>} logIds The log ids for which the reply count will be fetched.
 * @returns {Promise<Array<{ originLogId: number, replyCounter: number }>>} A promise resolving to an array of objects,
 * each containing for each originLogId the reply count.
 */
const getLogsWithReplyCountQuery = (logIds) => sequelize.query(`
    WITH RECURSIVE log_tree (originLogId, id) AS (
        SELECT id originId, id FROM logs
        WHERE id IN (:logIds)
        UNION ALL
        SELECT originLogId, l.id FROM logs as l
            JOIN log_tree AS lt ON lt.id = l.parent_log_id
    )
    SELECT originLogId, COUNT(*) - 1 as replyCount FROM log_tree GROUP BY originLogId;
`, {
    replacements: { logIds },
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
        const [results] = await getLogsWithReplyCountQuery(logIds);

        results.forEach((result) => {
            const count = result.replyCount || 0;
            const rowToAttachTo = rows.find(({ id }) => id === result.originLogId);

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

    /**
     * Returns the list of tags and their occurrences in the logs created in the given period
     *
     * @param {Period} period the period of log creation
     * @return {Promise<{tag: string, count: number}[]>} the tag and their amount
     */
    async getTagDistribution(period) {
        const [rows] = await getTagDistributionQuery(period);
        return rows;
    }
}

module.exports = new LogRepository();
