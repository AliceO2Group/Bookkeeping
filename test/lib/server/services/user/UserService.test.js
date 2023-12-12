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
const { createUser } = require('../../../../../lib/server/services/user/createUser.js');
const { getUser } = require('../../../../../lib/server/services/user/getUser.js');

module.exports = () => {
    it('should successfully get the existing user with getOrCreate function', async () => {
        const externalId = 1001;
        const name = 'testUser';

        // Create user in db
        await createUser({ externalUserId: externalId, name });

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
};
