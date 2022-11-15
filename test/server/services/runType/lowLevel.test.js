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
const { getRunType } = require('../../../../lib/server/services/runType/getRunType.js');
const { createRunType } = require('../../../../lib/server/services/runType/createRunType.js');
const { getOrCreateRunType } = require('../../../../lib/server/services/runType/getOrCreateRunType.js');

module.exports = () => {
    it('should successfully retrieve a given run type', async () => {
        const detectorById = await getRunType({ id: 12 });
        expect(detectorById).to.be.an('object');
        expect(detectorById.name).to.equal('PHYSICS');

        const detectorByName = await getRunType({ name: 'PHYSICS' });
        expect(detectorByName).to.be.an('object');
        expect(detectorByName.id).to.equal(12);
    });

    it('should successfully create a run type and return the corresponding ID', async () => {
        const id = await createRunType({ name: 'A-NEW-RUN-TYPE' });
        expect((await getRunType({ id })).name).to.equal('A-NEW-RUN-TYPE');
    });

    it('should successfully retrieve a given run type and create it if it does not exist', async () => {
        const runType = await getOrCreateRunType({ name: 'A-NEW-ONE' });
        expect(runType.name).to.equal('A-NEW-ONE');
    });
};
