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

const { models: { EnvironmentHistoryItem }, sequelize } = require('../');
const Repository = require('./Repository');
const { timestampToMysql } = require('../../server/utilities/timestampToMysql.js');

/**
 * Returns the SQL query for fetching the environment history combinations and
 * their occurrences within a specified time period.
 *
 * @param {Period} period the period on which the occurrences must be counted
 * @return {string} the raw SQL query
 */
const getHistoryDistributionQuery = ({ from, to }) => `
    SELECT environments, COUNT(*) AS count
    FROM (
        SELECT e.id, GROUP_CONCAT(ehi.status) AS environments
        FROM environments e
        JOIN environments_history_items ehi ON e.id = ehi.environment_id
        JOIN (
            SELECT DISTINCT environment_id
            FROM environments_history_items
            WHERE created_at BETWEEN '${timestampToMysql(from)}' AND '${timestampToMysql(to)}'
        ) AS environment_ids_in_period 
        ON e.id = environment_ids_in_period.environment_id
        GROUP BY e.id
    	HAVING SUBSTRING_INDEX(environments, ',', -1) IN ('DESTROYED', 'ERROR')
    ) AS history_by_environment_id
    GROUP BY environments
    ORDER BY count DESC;
`;

/**
 * Sequelize implementation of the EnvironmentHistoryItemRepository.
 */
class EnvironmentHistoryItemRepository extends Repository {
    /**
     * Creates a new `EnvironmentsHistoryItemRepository` instance.
     */
    constructor() {
        super(EnvironmentHistoryItem);
    }

    /**
     * Insert several environment history items at once
     *
     * @param {SequelizeEnvironmentHistoryItem[]} historyItems the items to insert
     * @return {Promise<void>} resolve once the insertion has been done
     */
    async bulkInsert(historyItems) {
        return EnvironmentHistoryItem.bulkCreate(historyItems, { returning: false });
    }

    /**
     * Returns the occurrences of each environment history combination for a given period.
     *
     * @param {Period} period the period on which occurrences must be counted
     * @return {Promise<{environments: string, count: number}[]>} the resulting histogram
     */
    async getHistoryDistribution(period) {
        const [rows] = await sequelize.query(getHistoryDistributionQuery(period), { raw: true });
        return rows;
    }
}

module.exports = new EnvironmentHistoryItemRepository();
