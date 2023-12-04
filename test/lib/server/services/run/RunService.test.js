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
const { SYNTHETIC, CALIBRATION } = require('../../../../mocks/mock-run.js');
const { getLog } = require('../../../../../lib/server/services/log/getLog.js');
const { updateRun } = require('../../../../../lib/server/services/run/updateRun.js');
const { RunDetectorQualities } = require('../../../../../lib/domain/enums/RunDetectorQualities.js');

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
    let lastLogId = 119;
    let lastRunNumber = 111;

    it('should successfully create the run type if it does not exist when creating or updating a run', async () => {
        let run = await runService.create({ ...baseRun, runNumber: ++lastRunNumber }, { runTypeName: 'DoNotExists' });
        expect(run.runType).to.be.an('object');
        expect(run.runType.name).to.equal('DoNotExists');

        run = await runService.update({ runNumber: lastRunNumber }, { relations: { runTypeName: 'DoNotExistsEither' } });
        expect(run.runType).to.be.an('object');
        expect(run.runType.name).to.equal('DoNotExistsEither');
    });

    it('should successfully create the given detectors if they do not exist', async () => {
        const run = await runService.create({ ...baseRun, runNumber: ++lastRunNumber, detectors: 'CTP,DONOTEXISTS,DONOTEXISTSEITHER' });
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
            runNumber: ++lastRunNumber,
            fillNumber: 3,
            timeTrgStart,
            timeTrgEnd,
        });
        expect(run.definition).to.equal(RunDefinition.Physics);
    });

    it('should throw when trying to change run quality without justification except from specific cases', async () => {
        await assert.rejects(
            () => runService.update(
                { runNumber: 1 },
                { runPatch: { runQuality: RunQualities.TEST } },
            ),
            new BadParameterError('Run quality change require a reason'),
        );
        await assert.rejects(
            () => runService.update(
                { runNumber: 1 },
                { runPatch: { runQuality: RunQualities.GOOD } },
            ),
            new BadParameterError('Run quality change require a reason'),
        );
        await assert.rejects(
            () => runService.update(
                { runNumber: 1 },
                { runPatch: { runQuality: RunQualities.NONE } },
            ),
            new BadParameterError('Run quality change require a reason'),
        );
        await runService.update(
            { runNumber: 1 },
            { runPatch: { runQuality: RunQualities.NONE }, metadata: { runQualityChangeReason: 'Justification' } },
        );
        // A log has been created
        ++lastLogId;
        await assert.rejects(
            () => runService.update(
                { runNumber: 1 },
                { runPatch: { runQuality: RunQualities.BAD } },
            ),
            new BadParameterError('Run quality change require a reason'),
        );
    });

    it('should throw when trying to change detector quality without justification', async () => {
        await assert.rejects(
            () => runService.update(
                { runNumber: 1 },
                { relations: { detectorsQualities: [{ detectorId: 1, quality: RunDetectorQualities.BAD }] } },
            ),
            new BadParameterError('Detector quality change reason is required when updating detector quality'),
        );
    });

    it('should successfully use default calibration status when creating a new calibration run', async () => {
        const run = await runService.create(
            { ...CALIBRATION.LASER, runNumber: ++lastRunNumber },
            { runTypeName: CALIBRATION.LASER.runType.name },
        );
        expect(run.definition).to.equal(RunDefinition.Calibration);
        expect(run.calibrationStatus).to.equal(DEFAULT_RUN_CALIBRATION_STATUS);
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
        run = await runService.update({ runNumber }, { runPatch: { calibrationStatus: RunCalibrationStatus.SUCCESS } });
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.SUCCESS);
        run = await runService.update({ runNumber }, { runPatch: { calibrationStatus: RunCalibrationStatus.NO_STATUS } });
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.NO_STATUS);
    });

    it('should successfully create a log when setting run calibration status to failed', async () => {
        const runNumber = 40;
        const reason = 'Here is the reason of the change';

        let run = await getRun({ runNumber });
        expect(run.definition).to.equal(RunDefinition.Calibration);
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.NO_STATUS);
        run = await runService.update(
            { runNumber },
            { runPatch: { calibrationStatus: RunCalibrationStatus.FAILED }, metadata: { calibrationStatusChangeReason: reason } },
        );
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.FAILED);
        const lastLog = await getLog(++lastLogId, (qb) => {
            qb.include('tags');
        });
        expect(lastLog.title).to.equal('Run 40 calibration status has changed to FAILED');
        expect(lastLog.text.startsWith('The calibration status for run 40 has been changed from NO STATUS to FAILED')).to.be.true;
        expect(lastLog.tags).to.lengthOf(1);
        expect(lastLog.tags[0].text).to.equal('CPV');
        expect(lastLog.text.endsWith(`Reason: ${reason}`)).to.be.true;
    });

    it('should successfully create a log when setting run calibration status from failed', async () => {
        const runNumber = 40;
        const reason = 'Here is the reason of the change';

        let run = await getRun({ runNumber });
        expect(run.definition).to.equal(RunDefinition.Calibration);
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.FAILED);
        run = await runService.update(
            { runNumber },
            { runPatch: { calibrationStatus: RunCalibrationStatus.SUCCESS }, metadata: { calibrationStatusChangeReason: reason } },
        );
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.SUCCESS);
        const lastLog = await getLog(++lastLogId, (qb) => {
            qb.include('tags');
        });
        expect(lastLog.title).to.equal('Run 40 calibration status has changed to SUCCESS');
        expect(lastLog.text.startsWith('The calibration status for run 40 has been changed from FAILED to SUCCESS')).to.be.true;
        expect(lastLog.tags).to.lengthOf(1);
        expect(lastLog.tags[0].text).to.equal('CPV');
        expect(lastLog.text.endsWith(`Reason: ${reason}`)).to.be.true;
    });

    it('should successfully prevent from updating calibration status from non-calibration runs', async () => {
        await assert.rejects(
            () => runService.update({ runNumber: 1 }, { runPatch: { calibrationStatus: RunCalibrationStatus.NO_STATUS } }),
            new BadParameterError('Calibration status is reserved to calibration runs'),
        );
    });

    it('should successfully throw when updating calibration run with a spurious reason', async () => {
        const runNumber = 40;

        const run = await getRun({ runNumber });
        expect(run.calibrationStatus).to.not.equal(RunCalibrationStatus.FAILED);

        await assert.rejects(
            () => runService.update(
                { runNumber },
                {
                    runPatch: { calibrationStatus: RunCalibrationStatus.NO_STATUS },
                    metadata: { calibrationStatusChangeReason: 'An inappropriate reason' },
                },
            ),
            new BadParameterError('Calibration status change reason can only be specified'
                + ` when changing from/to ${RunCalibrationStatus.FAILED}`),
        );
    });

    it('should successfully throw when updating calibration run to failed without reason', async () => {
        const runNumber = 40;

        await assert.rejects(
            () => runService.update({ runNumber }, { runPatch: { calibrationStatus: RunCalibrationStatus.FAILED } }),
            new BadParameterError(`Calibration status change require a reason when changing from/to ${RunCalibrationStatus.FAILED}`),
        );
    });

    it('should successfully throw when updating calibration run from failed without reason', async () => {
        const runNumber = 40;

        // Put back run calibration status to failed
        await updateRun(
            { runNumber },
            { runPatch: { calibrationStatus: RunCalibrationStatus.FAILED }, metadata: { calibrationStatusChangeReason: 'A reason' } },
        );

        const run = await getRun({ runNumber });
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.FAILED);

        await assert.rejects(
            () => runService.update({ runNumber }, { runPatch: { calibrationStatus: RunCalibrationStatus.NO_STATUS } }),
            new BadParameterError(`Calibration status change require a reason when changing from/to ${RunCalibrationStatus.FAILED}`),
        );
    });

    it('should successfully consider current patch to allow/disallow calibration status update', async () => {
        const runNumber = 106;
        let run = await getRun({ runNumber });
        expect(run.definition).to.equal(RunDefinition.Commissioning);
        expect(run.calibrationStatus).to.be.null;
        // Run was commissioning, set it to calibration and set calibration status at once
        run = await runService.update(
            { runNumber },
            { runPatch: { definition: RunDefinition.Calibration, calibrationStatus: RunCalibrationStatus.SUCCESS } },
        );
        expect(run.definition).to.equal(RunDefinition.Calibration);
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.SUCCESS);

        // Try to move the run to commissioning and set its calibration status in the same time
        await assert.rejects(
            () => runService.update(
                { runNumber },
                { runPatch: { definition: RunDefinition.Commissioning, calibrationStatus: RunCalibrationStatus.SUCCESS } },
            ),
            new BadParameterError('Calibration status is reserved to calibration runs'),
        );
    });

    it('should successfully set default values for run calibration status when changing calibration run definition', async () => {
        const runNumber = 106;
        let run = await getRun({ runNumber });
        expect(run.definition).to.equal(RunDefinition.Calibration);
        run = await runService.update({ runNumber }, { runPatch: { definition: RunDefinition.Commissioning } });
        expect(run.definition).to.equal(RunDefinition.Commissioning);
        expect(run.calibrationStatus).to.be.null;
        run = await runService.update({ runNumber }, { runPatch: { definition: RunDefinition.Calibration } });
        expect(run.definition).to.equal(RunDefinition.Calibration);
        expect(run.calibrationStatus).to.equal(DEFAULT_RUN_CALIBRATION_STATUS);
        // Put back definition to commissioning
        await runService.update({ runNumber }, { runPatch: { definition: RunDefinition.Commissioning } });
    });

    it('should successfully update run quality without justification in specific use-cases', async () => {
        const runNumber = 1;
        await runService.update(
            { runNumber },
            { runPatch: { runQuality: RunQualities.NONE }, metadata: { runQualityChangeReason: 'Justification' } },
        );
        await runService.update(
            { runNumber },
            { runPatch: { runQuality: RunQualities.GOOD } },
        );
        await runService.update(
            { runNumber },
            { runPatch: { runQuality: RunQualities.NONE }, metadata: { runQualityChangeReason: 'Justification' } },
        );
        await runService.update(
            { runNumber },
            { runPatch: { runQuality: RunQualities.TEST } },
        );
    });

    it('should successfully update run with eorReasons with reasonTypeId', async () => {
        const runNumber = 1;

        const eorReasons = [
            {
                reasonTypeId: 1,
                description: 'test1',
            },
            {
                reasonTypeId: 1,
                description: 'test2',
            },
            {
                reasonTypeId: 1,
                description: 'test3',
            },
        ];

        await runService.update(
            { runNumber },
            { relations: { eorReasons: eorReasons } },
        );
    });

    it('should successfully update run with eorReasons with category and title', async () => {
        const runNumber = 1;

        const eorReasons = [
            {
                category: 'DETECTORS',
                title: 'CPV',
                description: 'test1',
            },
            {
                category: 'DETECTORS',
                title: 'TPC',
                description: 'test2',
            },
            {
                category: 'DETECTORS',
                title: 'TPC',
                description: 'test3',
            },
        ];

        await runService.update(
            { runNumber },
            { relations: { eorReasons: eorReasons } },
        );
    });

    it('should successfully update run with empty eorReasons', async () => {
        const runNumber = 1;

        const eorReasons = [];

        await runService.update(
            { runNumber },
            { relations: { eorReasons: eorReasons } },
        );
    });

    it('should throw when trying to update run with non existing eorReason', async () => {
        const runNumber = 1;

        const eorReasons = [
            {
                category: 'NONE',
                title: 'NON-EXISTING TEST',
                description: 'non-existing',
            },
        ];

        await assert.rejects(
            () => runService.update(
                { runNumber },
                { relations: { eorReasons: eorReasons } },
            ),
            new Error('Provided reason types do not exist'),
        );
    });
};
