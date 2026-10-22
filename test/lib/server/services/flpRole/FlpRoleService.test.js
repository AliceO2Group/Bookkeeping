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

const { getFlpRole } = require('../../../../../lib/server/services/flp/getFlpRole.js');
const { expect } = require('chai');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');
const { flpRoleService } = require('../../../../../lib/server/services/flp/FlpRoleService.js');

module.exports = () => {
    it('should successfully update a given FLP role', async () => {
        const flpRoleId = 1;
        const flpName = 'FLP-TPC-1';
        const runNumber = 1;

        {
            const updatedFlpRole = await flpRoleService.update({ flpRoleId }, {
                nTimeframes: 100,
                bytesProcessed: 2048,
                bytesEquipmentReadOut: 32,
                bytesRecordingReadOut: 64,
                bytesFairMQReadOut: 128,
            });

            const flpRole = await getFlpRole({ flpRoleId });

            expect(flpRole.nTimeframes).to.equal(100);
            expect(flpRole.bytesProcessed).to.equal(2048);
            expect(flpRole.bytesEquipmentReadOut).to.equal(32);
            expect(flpRole.bytesRecordingReadOut).to.equal(64);
            expect(flpRole.bytesFairMQReadOut).to.equal(128);

            expect(updatedFlpRole.nTimeframes).to.equal(flpRole.nTimeframes);
            expect(updatedFlpRole.bytesProcessed).to.equal(flpRole.bytesProcessed);
            expect(updatedFlpRole.bytesEquipmentReadOut).to.equal(flpRole.bytesEquipmentReadOut);
            expect(updatedFlpRole.bytesRecordingReadOut).to.equal(flpRole.bytesRecordingReadOut);
            expect(updatedFlpRole.bytesFairMQReadOut).to.equal(flpRole.bytesFairMQReadOut);
        }

        {
            const updatedFlpRole = await flpRoleService.update({ flpName, runNumber }, {
                nTimeframes: 50,
                bytesProcessed: 1024,
                bytesEquipmentReadOut: 16,
                bytesRecordingReadOut: 40,
                bytesFairMQReadOut: 60,
            });

            const flpRole = await getFlpRole({ flpRoleId });

            expect(flpRole.nTimeframes).to.equal(50);
            expect(flpRole.bytesProcessed).to.equal(1024);
            expect(flpRole.bytesEquipmentReadOut).to.equal(16);
            expect(flpRole.bytesRecordingReadOut).to.equal(40);
            expect(flpRole.bytesFairMQReadOut).to.equal(60);

            expect(updatedFlpRole.nTimeframes).to.equal(flpRole.nTimeframes);
            expect(updatedFlpRole.bytesProcessed).to.equal(flpRole.bytesProcessed);
            expect(updatedFlpRole.bytesEquipmentReadOut).to.equal(flpRole.bytesEquipmentReadOut);
            expect(updatedFlpRole.bytesRecordingReadOut).to.equal(flpRole.bytesRecordingReadOut);
            expect(updatedFlpRole.bytesFairMQReadOut).to.equal(flpRole.bytesFairMQReadOut);
        }
    });

    it('should successfully get one FLP role with its run', async () => {
        const flpRole = await flpRoleService.getOneOrFail({ flpRoleId: 1 });
        expect(flpRole.id).to.equal(1);
        expect(flpRole.run).to.not.be.null;
    });

    it('should fail to get an FLP role that does not exist', async () => {
        let error;
        try {
            await flpRoleService.getOneOrFail({ flpRoleId: 999999999 });
        } catch (e) {
            error = e;
        }
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('FLP with this id (999999999) could not be found');
    });

    it('should successfully get a page of FLP roles, sorted by name descending by default', async () => {
        const { count, rows } = await flpRoleService.getAll({ limit: 2 });
        expect(count).to.be.greaterThan(2);
        expect(rows).to.have.lengthOf(2);
        expect(rows[0].name >= rows[1].name).to.be.true;

        const { rows: ascendingRows } = await flpRoleService.getAll({ limit: 2, sort: { name: 'asc' } });
        expect(ascendingRows[0].name <= ascendingRows[1].name).to.be.true;
    });

    it('should not modify the counters absent from the patch', async () => {
        const { bytesProcessed } = await flpRoleService.getOneOrFail({ flpRoleId: 1 });
        const updated = await flpRoleService.update({ flpRoleId: 1 }, { nTimeframes: 12 });
        expect(updated.nTimeframes).to.equal(12);
        expect(updated.bytesProcessed).to.equal(bytesProcessed);
    });
};
