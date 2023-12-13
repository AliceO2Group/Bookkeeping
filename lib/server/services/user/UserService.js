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

const { createOrUpdateUser } = require('./createOrUpdateUser.js');
const { getUser } = require('./getUser.js');

/**
 * @typedef UserIdentifier object to uniquely identify a user
 * @property {number} [userId] the id of the user in the application's context
 * @property {number} [externalUserId] the CERN user's id
 */

/**
 * Global service to handle runs instances
 */
class UserService {
    /**
     * Find a user from the database or create it as a new user if it does not exist yet.
     *
     * @param {UserIdentifier} identifier the identifier of the user to find
     * @param {string|null} name - username of the user
     * @returns {User} - found user | newly created user
     */
    async getOrCreate(identifier, name) {
        const foundUser = await getUser(identifier);

        // If the user does not exist, create it as a new user
        if (!foundUser) {
            const { externalUserId } = identifier;
            return await createOrUpdateUser({ personid: externalUserId, name });
        }

        return foundUser;
    }
}

exports.UserService = UserService;

exports.userService = new UserService();
