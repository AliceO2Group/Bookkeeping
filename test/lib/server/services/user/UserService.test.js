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

const { expect } = require('chai');
const { userService } = require('../../../../../lib/server/services/user/UserService.js');
const { getUser } = require('../../../../../lib/server/services/user/getUser.js');
const { createOrUpdateUser } = require('../../../../../lib/server/services/user/createOrUpdateUser.js');

module.exports = () => {
    it('should successfully get the existing user with getOrCreate function', async () => {
        const externalId = 1001;
        const name = 'testUser';

        // Create user in db
        await createOrUpdateUser({ personid: externalId, name });

        const user = await userService.getOrCreate({ externalUserId: externalId }, name);

        // User should exist now
        expect(user).not.to.be.null;
        // Id should be filled automatically
        expect(user.id).not.to.be.null;
        // ExternalId and name should be equal
        expect(user.externalId).to.equal(externalId);
        expect(user.name).to.equal(name);
    });

    it('should successfully create the non-existing user with getOrCreate function', async () => {
        const externalId = 1002;
        const name = 'testUser';

        // Before creation it should be null
        const nullUser = await getUser({ externalUserId: externalId });
        expect(nullUser).to.be.null;

        // Create the user using the getOrCreate function
        await userService.getOrCreate({ externalUserId: externalId }, name);
        const user = await getUser({ externalUserId: externalId });

        // User should exist now
        expect(user).not.to.be.null;
        // Id should be filled automatically
        expect(user.id).not.to.be.null;
        // ExternalId and name should be equal
        expect(user.externalId).to.equal(externalId);
        expect(user.name).to.equal(name);
    });

    it('should return false with empty user_o2_start and user_o2_stop', async () => {
        const result = await userService.validateUserFromGRPCRunRequest(null, null);

        expect(result).to.be.false;
    });

    it('should return false with invalid user', async () => {
        const user = {
            name: 'test',
        };

        const result = await userService.validateUserFromGRPCRunRequest(null, user);

        expect(result).to.be.false;
    });

    it('should return true with only empty user_o2_start', async () => {
        const user = {
            externalId: 1,
            name: 'test',
        };

        const result = await userService.validateUserFromGRPCRunRequest(null, user);

        expect(result).to.be.true;
    });

    it('should return true with only empty user_o2_stop', async () => {
        const user = {
            externalId: 1,
            name: 'test',
        };

        const result = await userService.validateUserFromGRPCRunRequest(user, null);

        expect(result).to.be.true;
    });

    it('should return true and add as a new user', async () => {
        const externalId = 10000;
        const name = 'test';
        const user = {
            externalId: externalId,
            name,
        };

        const result = await userService.validateUserFromGRPCRunRequest(user, user);

        const fetchedUser = await getUser({ externalUserId: externalId });

        expect(result).to.be.true;
        // User should exist
        expect(fetchedUser).not.to.be.null;
        // Id should have been filled automatically
        expect(fetchedUser.id).not.to.be.null;
        // ExternalId and name should be equal
        expect(fetchedUser.externalId).to.equal(externalId);
        expect(fetchedUser.name).to.equal(name);
    });
};
