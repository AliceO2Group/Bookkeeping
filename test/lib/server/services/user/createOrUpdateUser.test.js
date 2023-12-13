/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { expect } = require('chai');
const { createOrUpdateUser } = require('../../../../../lib/server/services/user/createOrUpdateUser');

module.exports = () => {
    it('should successfully create the user', async () => {
        const externalId = 1000;
        const name = 'testUser';

        const user = await createOrUpdateUser({ personid: externalId, name });

        // User should exist now
        expect(user).not.to.be.null;
        // Id should be filled automatically
        expect(user.id).not.to.be.null;
        // ExternalId and name should be equal
        expect(user.externalId).to.equal(externalId);
        expect(user.name).to.equal(name);
    });

    it('should successfully update the user', async () => {
        const externalId = 1001;
        const name = 'testUser';
        const updatedName = 'testUserUpdated';

        // Create user
        const user = await createOrUpdateUser({ personid: externalId, name });

        // Update user
        const updatedUser = await createOrUpdateUser({ personId: externalId, name: updatedName });

        // Users should exist now
        expect(user).not.to.be.null;
        expect(updatedUser).not.to.be.null;
        // Id should be filled automatically
        expect(user.id).not.to.be.null;
        // Id of user and updatedUser should be the same because it is updated
        expect(user.id).to.equal(updatedUser.id);
        // ExternalId should be equal
        expect(user.externalId).to.equal(updatedUser.externalId);
        // Name should be updated
        expect(user.name).to.equal(updatedName);
    });
};
