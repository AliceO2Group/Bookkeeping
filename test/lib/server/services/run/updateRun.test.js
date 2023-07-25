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

const { getRun } = require('../../../../../lib/server/services/run/getRun.js');
const { updateRun } = require('../../../../../lib/server/services/run/updateRun.js');
const { expect } = require('chai');
const { RunDefinition } = require('../../../../../lib/server/services/run/getRunDefinition.js');

module.exports = () => {
    it('should successfully update the run definition when updating run', async () => {
        const runNumber = 56;
        const run = await getRun({ runNumber });
        const { timeTrgStart, timeTrgEnd } = run;

        await updateRun({ runNumber }, {
            timeTrgStart: new Date('2020-01-01 01:00:00'),
            timeTrgEnd: new Date('2020-01-01 00:00:00'),
        });

        let updatedRun = await getRun({ runNumber });

        expect(updatedRun.definition).to.equal(RunDefinition.Commissioning);

        updatedRun = await updateRun({ runNumber }, { timeTrgStart, timeTrgEnd });

        expect(updatedRun.definition).to.equal(RunDefinition.Physics);
    });
};
