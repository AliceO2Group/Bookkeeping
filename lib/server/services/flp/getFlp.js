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
const FlpRepository = require('../../../database/repositories/FlpRepository.js');

/**
 * Find and return a flp model by its id
 *
 * @param {number} flpId the id of the flp to find
 * @param {function|null} qbConfiguration function called with the flp find query builder as parameter to add specific configuration to the query
 * @return {Promise<SequelizeFlp|null>} the flp found or null
 */
exports.getFlp = (flpId, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    queryBuilder.where('id').is(flpId);

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return FlpRepository.findOne(queryBuilder);
};
