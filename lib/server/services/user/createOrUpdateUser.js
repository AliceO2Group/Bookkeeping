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
const { BadParameterError } = require('../../errors/BadParameterError.js');
const UserRepository = require('../../../database/repositories/UserRepository.js');

/**
 * Creates or updates a user in the database and returns the user object
 *
 * @param {Object} newUser the user to create
 * @param {number} [newUser.personid] the CERN user's id, used as externalUserId
 * @param {string|null} [newUser.name] username for in bookkeeping db
 * @param {string|null} [newUser.access] access level
 * @param {string|null} [newUser.username] username from cern
 * @return {Promise<SequelizeUser>} resolve once the creation is done providing the user that has been (or will be) created
 */
exports.createOrUpdateUser = async (newUser) => {
    const { personid, name, access, username } = newUser;

    // Check null OR undefined because !personid returns true with personid == 0
    if (personid === null || personid === undefined) {
        throw new BadParameterError('Cannot create without personid');
    }

    // GetUser expects an identifier with two options, so surround it with {}
    let user = await getUser({ externalUserId: personid });
    if (user) {
        if (user.name !== name) {
            user = await UserRepository.update(user, { id: user.id, externalId: personid, name });
        }
    } else {
        user = await UserRepository.insert({ externalId: personid, name });
    }

    // Set user.access for server startup if present (WebUiServer)
    if (access) {
        user.access = access;
    }
    // Set user.username for server startup if present (WebUiServer)
    if (username) {
        user.username = username;
    }

    return user;
};
