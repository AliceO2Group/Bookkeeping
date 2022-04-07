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

const {
    adapters: {
        UserAdapter,
    },
} = require('../../domain');
const {
    repositories: {
        UserRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

// The in-memory caching
const lastSeen = {};
const userMap = {};

/**
 * CreateOrUpdateUser
 */
class CreateOrUpdateUser {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetTagDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { username, access, personid, name } = dto;

        const _1_MIN = 1 * 60 * 1000;
        if (lastSeen[personid] && lastSeen[personid] > Date.now() - _1_MIN) {
            return userMap[personid];
        }

        lastSeen[personid] = Date.now();

        const queryBuilder = new QueryBuilder()
            .where('externalId').is(personid);

        const user = await TransactionHelper.provide(async () => {
            let user;

            user = await UserRepository.findOne(queryBuilder);
            if (user) {
                let changed = false;
                if (user.name !== name) {
                    user.name = name;
                    changed = true;
                }

                if (changed) {
                    await user.save();
                }
            } else {
                user = await UserRepository.insert({
                    externalId: personid,
                    name: name,
                });
            }

            return UserAdapter.toEntity(user);
        });

        user.access = access;
        user.username = username;

        userMap[personid] = user;
        return user;
    }
}

module.exports = CreateOrUpdateUser;
