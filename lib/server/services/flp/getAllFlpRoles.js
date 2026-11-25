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
const { FlpRoleRepository } = require('../../../database/repositories/index.js');

/**
 * Find and return the FLP roles (with the number of matching rows)
 *
 * @param {(function(QueryBuilder):void)|null} [qbConfiguration=null] function called with the FLP roles find query builder as parameter to add
 *     specific configuration to the query
 * @return {Promise<{count: number, rows: SequelizeFlpRole[]}>} resolves with the FLP roles found and their count
 */
exports.getAllFlpRoles = (qbConfiguration = null) => {
    const queryBuilder = dataSource.createQueryBuilder();

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }

    return FlpRoleRepository.findAndCountAll(queryBuilder);
};
