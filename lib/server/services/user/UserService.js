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

const { userAdapter } = require('../../../database/adapters/index.js');
const { createOrUpdateUser } = require('./createOrUpdateUser.js');
const { getUser } = require('./getUser.js');

/**
 * @typedef UserIdentifier object to uniquely identify a user
 * @property {number} [userId] the id of the user in the application's context
 * @property {number} [externalUserId] the CERN user's id
 */

/**
 * Global service to handle user instances
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
            const user = await createOrUpdateUser({ personid: externalUserId, name });
            return user ? userAdapter.toEntity(user) : null;
        }

        return userAdapter.toEntity(foundUser);
    }

    /**
     * Validate the user send with the gRPC Run request
     *
     * @param {Object} user_o2_start the user that started the run
     * @param {Object} user_o2_stop the user that stopped the run
     * @return {boolean} whether the run can be created or not
     */
    async validateUserFromGRPCRunRequest(user_o2_start, user_o2_stop) {
        // If the user is invalid (externalId is not present or user is empty), return false
        if (!user_o2_start && !user_o2_stop) {
            // No user is send, run cannot be updated
            return false;
        }

        // If user does not exist, add it as a new user, return true
        if (user_o2_start?.externalId) {
            await this.getOrCreate({ externalUserId: user_o2_start.externalId }, user_o2_start.name);
            return true;
        }
        if (user_o2_stop?.externalId) {
            await this.getOrCreate({ externalUserId: user_o2_stop.externalId }, user_o2_stop.name);
            return true;
        }

        // Invalid users (no externalId present for one of the users)
        return false;
    }
}

exports.UserService = UserService;

exports.userService = new UserService();
