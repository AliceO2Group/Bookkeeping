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

const { utilities: { QueryBuilder } } = require('../../../database');
const LogRepository = require('../../../database/repositories/LogRepository.js');

/**
 * Find and return all root logs id's (logs with prentId as null)
 *
 * @param {function|null} qbConfiguration function called with the log find query builder as parameter to add specific configuration to the query
 * @return {Promise<SequelizeLog|null>} the log found or null
 */
exports.getRootLogIds = async (qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    queryBuilder.where('parentLogId').is(null);

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }

    // Getting all logs first
    const result = await LogRepository.findAndCountAll(queryBuilder);
    const logs = result.rows;

    // Map over the logs to extract only the IDs
    const logIds = logs.map((log) => log.id);

    // Return the count and the extracted IDs
    return {
        count: result.count,
        logIds: logIds,
    };
};
