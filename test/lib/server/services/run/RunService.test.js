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
const { getRun } = require('../../../../../lib/server/services/run/getRun.js');
const { RunCalibrationStatus, DEFAULT_RUN_CALIBRATION_STATUS } = require('../../../../../lib/domain/enums/RunCalibrationStatus.js');
const assert = require('assert');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');
const { SYNTHETIC, CALIBRATION } = require('../../../../mocks/mock-run.js');
const { getLog } = require('../../../../../lib/server/services/log/getLog.js');
const { updateRun } = require('../../../../../lib/server/services/run/updateRun.js');
const { RunDetectorQualities } = require('../../../../../lib/domain/enums/RunDetectorQualities.js');
const { RunDefinition } = require('../../../../../lib/domain/enums/RunDefinition.js');

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
        expect(run.definition).to.equal(RunDefinition.PHYSICS);
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
        expect(run.definition).to.equal(RunDefinition.CALIBRATION);
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
        expect(run.definition).to.equal(RunDefinition.CALIBRATION);
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
        expect(run.definition).to.equal(RunDefinition.CALIBRATION);
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
        expect(run.definition).to.equal(RunDefinition.CALIBRATION);
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

        // A new log has been created
        lastLogId++;

        const run = await getRun({ runNumber });
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.FAILED);

        await assert.rejects(
            () => runService.update({ runNumber }, { runPatch: { calibrationStatus: RunCalibrationStatus.NO_STATUS } }),
            new BadParameterError(`Calibration status change require a reason when changing from/to ${RunCalibrationStatus.FAILED}`),
        );
    });

    it('should successfully create a log when updating EoR reason to DETECTOR', async () => {
        const runNumber = 1;

        await runService.update(
            { runNumber },
            { relations: { eorReasons: [{ reasonTypeId: 2, description: 'A description' }] } },
        );

        const lastLog = await getLog(++lastLogId, (qb) => {
            qb.include('tags');
        });
        expect(lastLog.title).to.equal('EoR reason has changed for run 1');
        expect(lastLog.text).to.equal('End of run reason for the run 1 has been changed.\nThe new EoR reasons are:' +
            '\n- DETECTORS - TPC - A description');
        expect(lastLog.tags).to.lengthOf(0);
    });

    it('should successfully NOT create a log when updating EoR reason for something else than DETECTOR', async () => {
        const runNumber = 1;

        await runService.update(
            { runNumber },
            { relations: { eorReasons: [{ reasonTypeId: 3, description: 'A description' }] } },
        );

        expect(await getLog(lastLogId + 1, (qb) => qb.include('tags'))).to.be.null;
    });

    it('should successfully consider current patch to allow/disallow calibration status update', async () => {
        const runNumber = 106;
        let run = await getRun({ runNumber });
        expect(run.definition).to.equal(RunDefinition.PHYSICS);
        expect(run.calibrationStatus).to.be.null;
        // Run was commissioning, set it to calibration and set calibration status at once
        run = await runService.update(
            { runNumber },
            { runPatch: { definition: RunDefinition.CALIBRATION, calibrationStatus: RunCalibrationStatus.SUCCESS } },
        );
        expect(run.definition).to.equal(RunDefinition.CALIBRATION);
        expect(run.calibrationStatus).to.equal(RunCalibrationStatus.SUCCESS);

        // Try to move the run to commissioning and set its calibration status in the same time
        await assert.rejects(
            () => runService.update(
                { runNumber },
                { runPatch: { definition: RunDefinition.COMMISSIONING, calibrationStatus: RunCalibrationStatus.SUCCESS } },
            ),
            new BadParameterError('Calibration status is reserved to calibration runs'),
        );
    });

    it('should successfully set default values for run calibration status when changing calibration run definition', async () => {
        const runNumber = 106;
        let run = await getRun({ runNumber });
        expect(run.definition).to.equal(RunDefinition.CALIBRATION);
        run = await runService.update({ runNumber }, { runPatch: { definition: RunDefinition.COMMISSIONING } });
        expect(run.definition).to.equal(RunDefinition.COMMISSIONING);
        expect(run.calibrationStatus).to.be.null;
        run = await runService.update({ runNumber }, { runPatch: { definition: RunDefinition.CALIBRATION } });
        expect(run.definition).to.equal(RunDefinition.CALIBRATION);
        expect(run.calibrationStatus).to.equal(DEFAULT_RUN_CALIBRATION_STATUS);
        // Put back definition to commissioning
        await runService.update({ runNumber }, { runPatch: { definition: RunDefinition.COMMISSIONING } });
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
        const reasonTypeId = 1;

        const eorReasons = [
            {
                reasonTypeId: reasonTypeId,
                description: 'test1',
            },
            {
                reasonTypeId: reasonTypeId,
                description: 'test2',
            },
        ];

        const run = await runService.update(
            { runNumber },
            { relations: { eorReasons: eorReasons } },
        );

        expect(run.eorReasons).to.lengthOf(2);
        // Description is unique, should be equal
        for (let i = 0; i < run.eorReasons.length; i++) {
            expect(run.eorReasons[i].description).to.equal(eorReasons[i].description);
            // Also, check the reasonTypeId
            expect(run.eorReasons[i].reasonTypeId).to.equal(reasonTypeId);
        }
    });

    it('should successfully update run with eorReasons with category and title', async () => {
        const runNumber = 1;

        const eorReasons = [
            {
                // ReasonTypeId == 1 (from reason_types db seeder)
                category: 'DETECTORS',
                title: 'CPV',
                description: 'test1',
            },
            {
                // ReasonTypeId == 2 (from reason_types db seeder)
                category: 'DETECTORS',
                title: 'TPC',
                description: 'test2',
            },
        ];

        const run = await runService.update(
            { runNumber },
            { relations: { eorReasons: eorReasons } },
        );

        expect(run.eorReasons).to.lengthOf(2);
        // Description is unique, should be equal
        for (let i = 0; i < run.eorReasons.length; i++) {
            expect(run.eorReasons[i].description).to.equal(eorReasons[i].description);
            // Check category and title as well
            expect(run.eorReasons[i].category).to.equal(eorReasons[i].category);
            expect(run.eorReasons[i].title).to.equal(eorReasons[i].title);
        }
        // Also, check the reasonTypeId
        expect(run.eorReasons[0].reasonTypeId).to.equal(1);
        expect(run.eorReasons[1].reasonTypeId).to.equal(2);
    });

    it('should successfully update run with eorReasons with mixed category and title. reasonTypeId and non-existing reasonType', async () => {
        const runNumber = 1;
        const reasonTypeId = 1;

        const eorReasons = [
            {
                // ReasonTypeId == 1 (from reason_types db seeder)
                category: 'DETECTORS',
                title: 'CPV',
                description: 'test1',
            },
            {
                reasonTypeId: reasonTypeId,
                description: 'test2',
            },
            {
                category: 'NON-EXISTING',
                title: 'NON-EXISTING',
                description: 'test3',
            },
        ];

        const run = await runService.update(
            { runNumber },
            { relations: { eorReasons: eorReasons } },
        );

        // Should only include the valid ones without throwing for invalid one (is simply excluded)
        expect(run.eorReasons).to.lengthOf(2);
        // Only first and second should be includes
        expect(run.eorReasons[0].description).to.equal(eorReasons[0].description);
        expect(run.eorReasons[1].description).to.equal(eorReasons[1].description);
        // Also, check the reasonTypeId, category and title
        expect(run.eorReasons[0].reasonTypeId).to.equal(reasonTypeId);
        expect(run.eorReasons[0].category).to.equal(eorReasons[0].category);
        expect(run.eorReasons[0].title).to.equal(eorReasons[0].title);
        expect(run.eorReasons[1].reasonTypeId).to.equal(reasonTypeId);
    });

    it('should successfully update run with empty eorReasons', async () => {
        const runNumber = 1;

        const eorReasons = [];

        const run = await runService.update(
            { runNumber },
            { relations: { eorReasons: eorReasons } },
        );

        expect(run.eorReasons).to.lengthOf(0);
    });

    it('should add only eorReasons that do not have an id', async () => {
        const runNumber = 1;

        const eorReasons = [
            {
                id: 5000,
                category: 'DETECTORS',
                title: 'CPV',
                description: 'test1',
            },
            {
                id: 5001,
                category: 'DETECTORS',
                title: 'TPC',
                description: 'test2',
            },
            {
                // ReasonTypeId == 2 (from reason_types db seeder)
                category: 'DETECTORS',
                title: 'TPC',
                description: 'test3',
            },
        ];

        const run = await runService.update(
            { runNumber },
            { relations: { eorReasons: eorReasons } },
        );

        // EorReasons should only include the one that does not have an id
        expect(run.eorReasons).to.lengthOf(1);
        // Only last one should be included
        expect(run.eorReasons[0].description).to.equal(eorReasons[2].description);
        // Also, check the reasonTypeId, category and title
        expect(run.eorReasons[0].reasonTypeId).to.equal(2);
        // Check category and title as well
        expect(run.eorReasons[0].category).to.equal(eorReasons[2].category);
        expect(run.eorReasons[0].title).to.equal(eorReasons[2].title);
    });

    it('should successfully create run with only userO2Start', async () => {
        const runNumber = ++lastRunNumber;
        const userO2Start = {
            userIdentifier: { externalUserId: 1000 },
            name: 'test',
        };

        const run = await runService.create(
            // Run
            {
                runNumber: runNumber,
            },
            // Relations
            {
                userO2Start: userO2Start,
            },
        );

        // Run and user should exist
        expect(run).to.not.be.null;
        expect(run.userIdO2Start).to.not.be.null;
    });

    it('should successfully create run with only userO2Stop', async () => {
        const runNumber = ++lastRunNumber;
        const userO2Stop = {
            userIdentifier: { externalUserId: 1001 },
            name: 'test',
        };

        const run = await runService.create(
            // Run
            {
                runNumber: runNumber,
            },
            // Relations
            {
                userO2Stop: userO2Stop,
            },
        );

        // Run and user should exist
        expect(run).to.not.be.null;
        expect(run.userIdO2Stop).to.not.be.null;
    });

    it('should successfully create run with userO2Start and userO2Stop', async () => {
        const runNumber = ++lastRunNumber;
        const userO2Start = {
            userIdentifier: { externalUserId: 1002 },
            name: 'test',
        };
        const userO2Stop = {
            userIdentifier: { externalUserId: 1003 },
            name: 'test',
        };

        const run = await runService.create(
            // Run
            {
                runNumber: runNumber,
            },
            // Relations
            {
                userO2Start: userO2Start,
                userO2Stop: userO2Stop,
            },
        );

        // Run and user should exist
        expect(run).to.not.be.null;
        expect(run.userIdO2Start).to.not.be.null;
        expect(run.userIdO2Stop).to.not.be.null;
    });

    it('should successfully update run with only userO2Start', async () => {
        const runNumber = 1;
        const userO2Start = {
            userIdentifier: { externalUserId: 1000 },
            name: 'test',
        };

        const run = await runService.update(
            { runNumber },
            {
                relations: {
                    userO2Start: userO2Start,
                },
            },
        );

        // Run and user should exist
        expect(run).to.not.be.null;
        expect(run.userIdO2Start).to.not.be.null;
    });

    it('should successfully update run with only userO2Stop', async () => {
        const runNumber = 1;
        const userO2Stop = {
            userIdentifier: { externalUserId: 1000 },
            name: 'test',
        };

        const run = await runService.update(
            { runNumber },
            {
                relations: {
                    userO2Stop: userO2Stop,
                },
            },
        );

        // Run and user should exist
        expect(run).to.not.be.null;
        expect(run.userIdO2Stop).to.not.be.null;
    });

    it('should successfully update run with userO2Start and userO2Stop', async () => {
        const runNumber = 1;
        const userO2Start = {
            userIdentifier: { externalUserId: 1002 },
            name: 'test',
        };
        const userO2Stop = {
            userIdentifier: { externalUserId: 1003 },
            name: 'test',
        };

        const run = await runService.update(
            { runNumber },
            {
                relations: {
                    userO2Start: userO2Start,
                    userO2Stop: userO2Stop,
                },
            },
        );

        // Run and user should exist
        expect(run).to.not.be.null;
        expect(run.userIdO2Start).to.not.be.null;
        expect(run.userIdO2Stop).to.not.be.null;
    });

    it('should successfully update run phase shift at start and end', async () => {
        const runNumber = 1;
        const run = await runService.update(
            { runNumber },
            {
                runPatch: {
                    phaseShiftAtStartBeam1: 0.0004,
                    phaseShiftAtStartBeam2: -0.0001,
                    phaseShiftAtEndBeam1: 0.0005,
                    phaseShiftAtEndBeam2: -0.0002,
                },
            },
        );
        expect(run.phaseShiftAtStartBeam1).to.equal(0.0004);
        expect(run.phaseShiftAtStartBeam2).to.equal(-0.0001);
        expect(run.phaseShiftAtEndBeam1).to.equal(0.0005);
        expect(run.phaseShiftAtEndBeam2).to.equal(-0.0002);
    });

    it('should successfully update run cross-section and trigger acceptance', async () => {
        const runNumber = 1;
        const run = await runService.update(
            { runNumber },
            {
                runPatch: {
                    crossSection: 0.0001,
                    triggerEfficiency: 0.0002,
                    triggerAcceptance: 0.0003,
                },
            },
        );
        expect(run.crossSection).to.equal(0.0001);
        expect(run.triggerEfficiency).to.equal(0.0002);
        expect(run.triggerAcceptance).to.equal(0.0003);
    });

    it('Should successfully update run raw trigger configuration', async () => {
        const runNumber = 1;
        const run = await runService.update(
            { runNumber },
            {
                runPatch: {
                    triggerRawConfiguration: 'Raw\nTrigger\nConfiguration',
                },
            },
        );
        expect(run.triggerRawConfiguration).to.equal('Raw\nTrigger\nConfiguration');
    });

    it('should fetch distinct aliceCurrent levels', async () => {
        const levelsCombinations = await runService.getAllAliceL3AndDipoleLevelsForPhysicsRuns();
        expect(levelsCombinations).have.all.deep.members([{ l3Level: 20003, dipoleLevel: 0 }, { l3Level: 30003, dipoleLevel: 0 }]);
    });

    it('should successfully extract information from environment configuration when creating a run', async () => {
        const timeO2Start = new Date('2019-08-09 20:01:00');
        const timeTrgStart = new Date('2019-08-09 20:02:00');
        const timeTrgEnd = new Date('2019-08-09 20:03:00');
        const timeO2End = new Date('2019-08-09 20:04:00');
        const run = await runService.createOrUpdate(
            1234,
            'CmCvjNbg',
            { timeO2Start, timeTrgStart, timeTrgEnd, timeO2End },
            { userO2Start: { userIdentifier: { externalUserId: 1 } }, userO2Stop: { userIdentifier: { externalUserId: 456 } } },
        );

        expect(run.triggerValue).to.equal('CTP');
        expect(run.detectors).to.equal('FT0,ITS');
        expect(run.detectorsQualities.map(({ name }) => name)).to.eql(['FT0', 'ITS']);
        expect(run.nDetectors).to.equal(2);
        expect(run.runType.name).to.equal('PHYSICS');
        expect(run.dd_flp).to.equal(true);
        expect(run.dcs).to.equal(true);
        expect(run.epn).to.equal(true);
        expect(run.pdpConfigOption).to.equal('Repository hash');
        expect(run.pdpTopologyDescriptionLibraryFile).to.equal('production/production.desc');
        expect(run.pdpWorkflowParameters).to.equal('QC,GPU,CALIB,EVENT_DISPLAY');
        expect(run.tfbDdMode).to.equal('physics');
        expect(run.lhcPeriod.name).to.equal('new');
        expect(run.odcTopologyFullName).to.equal('(hash, default, production/production.desc, synchronous-workflow-calib)');
        expect(run.pdpBeamType).to.equal('pp');
        expect(run.epnTopology).to.equal('topology');
        expect(run.odcTopologyFullName).to.equal('(hash, default, production/production.desc, synchronous-workflow-calib)');
        expect(run.nFlps).to.equal(3);
        expect(run.nEpns).to.equal(2);
        expect(run.readoutCfgUri).to.equal('file:///local/replay/2024-04-17-pp-650khz-synt-4tf/readout-replay-24g-dd40.cfg');
        expect(run.userIdO2Start).to.equal(1);
        expect(run.userIdO2Stop).to.equal(2);
        expect(run.flpRoles.map(({ name }) => name)).to.deep.equal(['fake-flp1', 'fake-flp2', 'fake-ctp-host']);
    });
};
