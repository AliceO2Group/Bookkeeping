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
const { getRun } = require('../../../../../lib/server/services/run/getRun.js');
const { RunCalibrationStatus, DEFAULT_RUN_CALIBRATION_STATUS } = require('../../../../../lib/domain/enums/RunCalibrationStatus.js');
const assert = require('assert');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');
const { SYNTHETIC } = require('../../../../mocks/mock-run.js');
const { getLog } = require('../../../../../lib/server/services/log/getLog.js');

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

    it('should successfully prevent to create a non-calibration run with a calibrationStatus', async () => {
        await assert.rejects(
            () => runService.create({ ...SYNTHETIC.PBPB, calibrationStatus: RunCalibrationStatus.SUCCESS }),
            new BadParameterError('Calibration status is reserved to calibration runs'),
        );
    });

    it('should successfully allow to update run calibration status', async () => {
        const runNumber = 40;
        let run = await getRun({ runNumber });
        expect(run.definition).to.equal(RunDefinition.Calibration);
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.NO_STATUS);
        run = await runService.update({ runNumber }, { calibrationStatus: RunCalibrationStatus.SUCCESS });
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.SUCCESS);
        run = await runService.update({ runNumber }, { calibrationStatus: RunCalibrationStatus.NO_STATUS });
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.NO_STATUS);
    });

    it('should successfully create a log when setting run calibration status to failled', async () => {
        const runNumber = 40;
        let run = await getRun({ runNumber });
        expect(run.definition).to.equal(RunDefinition.Calibration);
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.NO_STATUS);
        run = await runService.update({ runNumber }, { calibrationStatus: RunCalibrationStatus.FAILED });
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.FAILED);
        const lastLog = await getLog(120, (qb) => {
            qb.include('tags');
        });
        expect(lastLog.title).to.equal('Run 40 calibration status has changed to FAILED');
        expect(lastLog.text.startsWith('The calibration status for run 40 has been changed from NO STATUS to FAILED')).to.be.true;
        expect(lastLog.tags).to.lengthOf(1);
        expect(lastLog.tags[0].text).to.equal('CPV');
    });

    it('should successfully prevent from updating calibration status from non-calibration runs', async () => {
        await assert.rejects(
            () => runService.update({ runNumber: 1 }, { calibrationStatus: RunCalibrationStatus.NO_STATUS }),
            new BadParameterError('Calibration status is reserved to calibration runs'),
        );
    });

    it('should successfully consider current patch to allow/disallow calibration status update', async () => {
        const runNumber = 106;
        let run = await getRun({ runNumber });
        expect(run.definition).to.equal(RunDefinition.Commissioning);
        expect(run.calibrationStatus).to.be.null;
        // Run was commissioning, set it to calibration and set calibration status at once
        run = await runService.update({ runNumber }, { definition: RunDefinition.Calibration, calibrationStatus: RunCalibrationStatus.SUCCESS });
        expect(run.definition).to.equal(RunDefinition.Calibration);
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.SUCCESS);

        // Try to move the run to commissioning and set its calibration status in the same time
        await assert.rejects(
            () => runService.update(
                { runNumber },
                { definition: RunDefinition.Commissioning, calibrationStatus: RunCalibrationStatus.SUCCESS },
            ),
            new BadParameterError('Calibration status is reserved to calibration runs'),
        );
    });

    it('should successfully set default values for run calibration status when changing calibration run definition', async () => {
        const runNumber = 106;
        let run = await getRun({ runNumber });
        expect(run.definition).to.equal(RunDefinition.Calibration);
        run = await runService.update({ runNumber }, { definition: RunDefinition.Commissioning });
        expect(run.definition).to.equal(RunDefinition.Commissioning);
        expect(run.calibrationStatus).to.be.null;
        run = await runService.update({ runNumber }, { definition: RunDefinition.Calibration });
        expect(run.definition).to.equal(RunDefinition.Calibration);
        expect(run.calibrationStatus).to.equal(DEFAULT_RUN_CALIBRATION_STATUS);
        // Put back definition to commissioning
        await runService.update({ runNumber }, { definition: RunDefinition.Commissioning });
    });
};
