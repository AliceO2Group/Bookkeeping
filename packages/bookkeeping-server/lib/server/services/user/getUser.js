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
const UserRepository = require('../../../database/repositories/UserRepository.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');

/**
 * Find and return a user model by its id
 *
 * @param {UserIdentifier} identifier the identifier of the user to find
 * @param {function|null} qbConfiguration function called with the user find query builder as parameter to add specific configuration to
 *     the query
 * @return {Promise<SequelizeUser|null>} the user found or null
 */
exports.getUser = ({ userId, externalUserId }, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    if (userId !== undefined) {
        queryBuilder.where('id').is(userId);
    } else if (externalUserId !== undefined) {
        queryBuilder.where('externalId').is(externalUserId);
    } else {
        throw new BadParameterError('Can not find without id or external id');
    }

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return UserRepository.findOne(queryBuilder);
};
