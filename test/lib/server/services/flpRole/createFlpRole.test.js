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

const { createFlpRole } = require('../../../../../lib/server/services/flp/createFlpRole.js');
const { getFlpRole } = require('../../../../../lib/server/services/flp/getFlpRole.js');
const { expect } = require('chai');
const assert = require('assert');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');
const { ConflictError } = require('../../../../../lib/server/errors/ConflictError.js');

module.exports = () => {
    it('should successfully create an FLP role', async () => {
        const runNumber1 = 34;
        const runNumber2 = 35;
        const name = 'MY-FLP';
        const hostname = 'localhost';

        {
            const flpRoleId = await createFlpRole({
                runNumber: runNumber1,
                name,
                hostname,
                nTimeframes: 100,
                bytesProcessed: 100,
                bytesEquipmentReadOut: 100,
                bytesRecordingReadOut: 100,
                bytesFairMQReadOut: 100,
            });
            const flpRole = await getFlpRole({ flpRoleId });

            expect(flpRole.runNumber).to.equal(runNumber1);
            expect(flpRole.name).to.equal(name);
            expect(flpRole.hostname).to.equal(hostname);
            expect(flpRole.nTimeframes).to.equal(100);
            expect(flpRole.bytesProcessed).to.equal(100);
            expect(flpRole.bytesEquipmentReadOut).to.equal(100);
            expect(flpRole.bytesRecordingReadOut).to.equal(100);
            expect(flpRole.bytesFairMQReadOut).to.equal(100);
        }

        {
            const flpRoleId = await createFlpRole({ runNumber: runNumber2, name, hostname });
            const flpRole = await getFlpRole({ flpRoleId });

            expect(flpRole.runNumber).to.equal(runNumber2);
            expect(flpRole.name).to.equal(name);
            expect(flpRole.hostname).to.equal(hostname);
        }
    });

    it('should throw an error when trying to create an invalid FLP', async () => {
        await assert.rejects(
            () => createFlpRole({ runNumber: 0, name: '', hostname: '' }),
            new BadParameterError('"name" is not allowed to be empty, "hostname" is not allowed to be empty,' +
                ' "runNumber" must be a positive number'),
        );
    });
};
