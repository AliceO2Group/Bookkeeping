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
const { runService } = require('../../../../../lib/server/services/run/RunService.js');
const { getDetectorsByNames } = require('../../../../../lib/server/services/detector/getDetectorsByNames.js');
const { RunQualities } = require('../../../../../lib/domain/enums/RunQualities.js');
const { RunDefinition } = require('../../../../../lib/server/services/run/getRunDefinition.js');

module.exports = () => {
    const baseRun = {
        timeO2Start: '2022-03-21 13:00:00',
        timeTrgStart: '2022-03-21 13:00:00',
        environmentId: 'RYnWCcgd',
        runType: 'NONE',
        runQuality: RunQualities.TEST,
        nDetectors: 3,
        bytesReadOut: 1024,
        nSubtimeframes: 10,
        nFlps: 10,
        nEpns: 10,
        dd_flp: false,
        dcs: false,
        epn: false,
        epnTopology: 'normal',
        detectors: '',
    };

    it('should successfully create the run type if it does not exist when creating or updating a run', async () => {
        let run = await runService.create({ ...baseRun, runNumber: 112 }, { runTypeName: 'DoNotExists' });
        expect(run.runType).to.be.an('object');
        expect(run.runType.name).to.equal('DoNotExists');

        run = await runService.update({ runNumber: 112 }, {}, { runTypeName: 'DoNotExistsEither' });
        expect(run.runType).to.be.an('object');
        expect(run.runType.name).to.equal('DoNotExistsEither');
    });

    it('should successfully create the given detectors if they do not exist', async () => {
        const run = await runService.create({ ...baseRun, runNumber: 113, detectors: 'CTP,DONOTEXISTS,DONOTEXISTSEITHER' });
        expect(run.detectors).to.be.a('string');
        expect((await getDetectorsByNames(['DONOTEXISTS', 'DONOTEXISTSEITHER'])).map(({ name }) => name))
            .to.eql(['DONOTEXISTS', 'DONOTEXISTSEITHER']);
    });

    it('should successfully compute definition when creating a new run', async () => {
        const timeTrgStart = new Date('2022-03-21 17:00:00');
        const timeTrgEnd = new Date('2022-03-21 19:00:00');

        const run = await runService.create({
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            detectors: 'ITS, TST, FT0',
            runNumber: 114,
            fillNumber: 3,
            timeTrgStart,
            timeTrgEnd,
        });
        expect(run.definition).to.equal(RunDefinition.Physics);
    });
};
