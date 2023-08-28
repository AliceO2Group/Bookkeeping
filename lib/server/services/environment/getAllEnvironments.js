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

const { repositories: { EnvironmentRepository }, utilities: { QueryBuilder } } = require('../../../database');

/**
 * Return all the environments that belongs to the given list of ids (not existing ids are ignored)
 *
 * @param {string[]} ids the list of ids for which environments must be retrieved
 * @param {function|null} [qbConfiguration] function called with the environments find query builder
 *      as parameter to add specific configuration to the query
 * @returns {Promise<SequelizeEnvironment[]>} Promise resolving with the list of environments
 */
exports.getAllEnvironments = async (ids, qbConfiguration) => {
    if (ids.length === 0) {
        return [];
    }

    const queryBuilder = new QueryBuilder().where('id').oneOf(...ids);

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }

    return EnvironmentRepository.findAll(queryBuilder);
};
