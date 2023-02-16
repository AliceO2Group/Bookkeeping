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
const EnvironmentHistoryItemRepository = require('../../../database/repositories/EnvironmentHistoryItemRepository.js');

/**
 * Find and return an environment's history item model by its id
 *
 * @param {number} environmentHistoryItemId the id of the environment's history to find
 * @param {function|null} qbConfiguration function called with the environment's history item find query builder as parameter to add specific
 *     configuration to the query
 * @return {Promise<SequelizeEnvironmentHistoryItem|null>} the environment's history item found or null
 */
exports.getEnvironmentHistoryItem = (environmentHistoryItemId, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    queryBuilder.where('id').is(environmentHistoryItemId);

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return EnvironmentHistoryItemRepository.findOne(queryBuilder);
};
