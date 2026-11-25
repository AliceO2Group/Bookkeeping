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

const { dataSource } = require('../../../database/DataSource.js');
const { LhcPeriodStatisticsRepository } = require('../../../database/repositories/index.js');

/**
 * Find and return the statistics of the LHC periods (with the number of matching rows)
 *
 * @param {(function(QueryBuilder):void)|null} [qbConfiguration=null] function called with the statistics find query builder as parameter
 *     to add specific configuration to the query
 * @return {Promise<{count: number|object[], rows: SequelizeLhcPeriodStatistics[]}>} resolves with the statistics found and their count. When
 *     the query is grouped (as the one prepared by the LHC period statistics service), the count is the list of the counts of each group
 */
exports.getAllLhcPeriodStatistics = (qbConfiguration = null) => {
    const queryBuilder = dataSource.createQueryBuilder();

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }

    return LhcPeriodStatisticsRepository.findAndCountAll(queryBuilder);
};
