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

const { createUser } = require('../../../../../lib/server/services/user/createUser.js');
const { expect } = require('chai');

module.exports = () => {
    it('should successfully create the user', async () => {
        const externalId = 1000;
        const name = 'testUser';

        const user = await createUser({ externalUserId: externalId, name });

        // User should exist now
        expect(user).not.to.be.null;
        // Id should be filled automatically
        expect(user.id).not.to.be.null;
        // ExternalId and name should be equal
        expect(user.externalId).to.equal(externalId);
        expect(user.name).to.equal(name);
    });
};
