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
const FlpRoleRepository = require('../../../database/repositories/FlpRoleRepository.js');

/**
 * Find and return an FLP role model by its id
 *
 * @param {number} flpRoleId the id of the FLP role to find
 * @param {function|null} qbConfiguration function called with the FLP role find query builder as parameter to add specific configuration to the
 *     query
 * @return {Promise<SequelizeFlpRole|null>} the FLP role found or null
 */
exports.getFlpRole = (flpRoleId, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    queryBuilder.where('id').is(flpRoleId);

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return FlpRoleRepository.findOne(queryBuilder);
};
