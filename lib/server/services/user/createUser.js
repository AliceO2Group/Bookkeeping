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
 * or submit itself to any jusdiction.
 */

const { getUser } = require('./getUser.js');
const { ConflictError } = require('../../errors/ConflictError.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const UserRepository = require('../../../database/repositories/UserRepository.js');

/**
 * Create a user in the database and return the auto generated id
 *
 * @param {Partial<SequelizeUser>} newUser the user to create
 * @param {number} [newUser.externalUserId] the CERN user's id
 * @param {string|null} [newUser.name] username
 * @return {Promise<SequelizeUser>} resolve once the creation is done providing the user that has been (or will be) created
 */
exports.createUser = async (newUser) => {
    // Extract externalUserId as the identifier
    const { externalUserId, name } = newUser;

    if (!externalUserId) {
        throw new BadParameterError('Cannot create without external id');
    }

    if (externalUserId) {
        // GetUser expects an identifier with two options, so surround it with {}
        const existingUser = await getUser({ externalUserId });
        if (existingUser) {
            throw new ConflictError(`A user already exists with externalUserId: ${externalUserId}`);
        }
    }

    const user = await UserRepository.insert({ externalId: externalUserId, name });
    return user;
};
