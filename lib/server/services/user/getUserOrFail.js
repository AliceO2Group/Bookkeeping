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

const { getUser } = require('./getUser.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');

/**
 * Find a user model by its id and reject with a NotFoundError if none is found
 *
 * @param {UserIdentifier} identifier the identifier of the user to find
 * @return {Promise<SequelizeUser>} resolve with the user model found or reject with a NotFoundError
 */
exports.getUserOrFail = async (identifier) => {
    const userModel = await getUser(identifier);
    if (userModel !== null) {
        return userModel;
    } else {
        const criteriaExpression = identifier.userId ? `id (${identifier.userId})` : `external id (${identifier.externalUserId})`;
        throw new NotFoundError(`User with this ${criteriaExpression} could not be found`);
    }
};
