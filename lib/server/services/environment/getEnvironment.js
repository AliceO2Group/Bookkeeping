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
const EnvironmentRepository = require('../../../database/repositories/EnvironmentRepository.js');

/**
 * Find and return an environment model by its id
 *
 * @param {string} environmentId the id of the environment to find
 * @param {function|null} qbConfiguration function called with the environment find query builder as parameter to add specific configuration to
 *     the query
 * @return {Promise<SequelizeEnvironment|null>} the environment found or null
 */
exports.getEnvironment = (environmentId, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    queryBuilder.where('id').is(environmentId);

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return EnvironmentRepository.findOne(queryBuilder);
};
