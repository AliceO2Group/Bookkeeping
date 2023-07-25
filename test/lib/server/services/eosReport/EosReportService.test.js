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

const { eosReportService } = require('../../../../../lib/server/services/eosReport/EosReportService.js');
const { expect } = require('chai');
const {
    emptyECSEosReportRequest,
    formattedCustomizedECSEosReport,
    customizedECSEosReport,
    eosEcsReportTitle,
    customizedECSEosReportRequest,
    formattedEmptyECSEosReport,
    customizedECSEosReportLogs,
} = require('../../../../mocks/mock-ecs-eos-report.js');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { createLog } = require('../../../../../lib/server/services/log/createLog.js');
const { ShiftTypes } = require('../../../../../lib/domain/enums/ShiftTypes.js');
const { LogRunsRepository } = require('../../../../../lib/database/repositories/index.js');
const { createEnvironment } = require('../../../../../lib/server/services/environment/createEnvironment.js');
const { createEnvironmentHistoryItem } = require('../../../../../lib/server/services/environmentHistoryItem/createEnvironmentHistoryItem.js');
const { createRun } = require('../../../../../lib/server/services/run/createRun.js');
const EorReasonRepository = require('../../../../../lib/database/repositories/EorReasonRepository.js');
const { getEosReportTagsByType } = require('../../../../../lib/server/services/eosReport/eosTypeSpecificFormatter/getEosReportTagsByType.js');
const {
    formattedEmptyQcPdpEosReport, eosQcPdpReportTitle, emptyQcPdpEosReportRequest, customizedQcPdpEosReport, customizedQcPdpEosReportLogs,
    customizedQcPdpEosReportRequest, formattedCustomizedQcPdpEosReport,
} = require('../../../../mocks/mock-qc-pdp-eos-report.js');
const { updateRunDetector } = require('../../../../../lib/server/services/runDetector/updateRunDetector.js');
const {
    customizedSlimosEosReportLogs, customizedSlimosEosReport, customizedSlimosEosReportRequest, formattedCustomizedSlimosEosReport,
    eosSlimosReportTitle, emptySlimosEosReportRequest, formattedEmptySlimosEosReport,
} = require('../../../../mocks/mock-slimos-eos-report.js');
const {
    customizedShiftLeaderEosReport, customizedShiftLeaderEosReportLogs, customizedShiftLeaderEosReportRequest,
    formattedCustomizedShiftLeaderEosReport, eosShiftLeaderReportTitle, emptyShiftLeaderEosReportRequest, formattedEmptyShiftLeaderEosReport,
} = require('../../../../mocks/mock-shift-leader-eos-report.js');
const {
    customizedDcsEosReportLogs, customizedDcsEosReport, customizedDcsEosReportRequest, formattedCustomizedDcsEosReport, eosDcsReportTitle,
    emptyDcsEosReportRequest, formattedEmptyDcsEosReport,
} = require('../../../../mocks/mock-dcs-eos-report.js');

module.exports = () => {
    it('should successfully create a log containing ECS EoS report', async () => {
        const expectedRunNumbers = [];

        // Create the expected logs and runs
        for (const environment of customizedECSEosReport.typeSpecific.environments) {
            await createEnvironment(environment);
            await createEnvironmentHistoryItem({
                status: 'DESTROYED',
                createdAt: environment.createdAt,
                updatedAt: environment.updatedAt,
                environmentId: environment.id,
            });
            for (const run of environment.runs) {
                const runId = await createRun(run);
                expectedRunNumbers.push(run.runNumber);

                // Create the expected EOR
                const eorReasons = [];
                for (const eorReason of run.eorReasons) {
                    eorReasons.push({ reasonTypeId: eorReason.reasonTypeId, description: eorReason.description, runId });
                }
                if (eorReasons.length > 0) {
                    await EorReasonRepository.addMany(eorReasons);
                }
            }
        }

        // Create the expected logs
        const logRuns = [];
        for (const log of customizedECSEosReportLogs) {
            const logCreationRequest = {
                title: log.title,
                text: 'This is not important for test',
                createdAt: customizedECSEosReport.shiftStart,
                subtype: 'comment',
                origin: 'human',
            };
            if (log.parentLogId) {
                logCreationRequest.parentLogId = log.parentLogId;
            }
            const logId = await createLog(logCreationRequest, [200], log.tags.map(({ text }) => text), []);
            logRuns.push({ logId, runId: 1 });
        }

        LogRunsRepository.bulkInsert(logRuns);

        const log = await eosReportService.createLogEntry(ShiftTypes.ECS, customizedECSEosReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedCustomizedECSEosReport);
        expect(log.title).to.equal(eosEcsReportTitle);
        expect(log.tags.map(({ text }) => text)).to.have.members(getEosReportTagsByType(ShiftTypes.ECS));
        expect(log.runs.map(({ runNumber }) => runNumber)).to.eql(expectedRunNumbers);
        expect(log.author.id).to.equal(1);
    });

    it('should successfully create a log containing ECS EoS report with default values', async () => {
        await resetDatabaseContent();

        const log = await eosReportService.createLogEntry(ShiftTypes.ECS, emptyECSEosReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedEmptyECSEosReport);
        expect(log.title).to.equal(eosEcsReportTitle);
        expect(log.runs.length).to.equal(0);
        expect(log.author.id).to.equal(1);
    });

    it('should successfully create a log containing QC/PDP EoS report', async () => {
        await resetDatabaseContent();
        const expectedRunNumbers = [];

        // Create the expected logs and runs
        for (const runs of Object.values(customizedQcPdpEosReport.typeSpecific.runs)) {
            for (const run of runs) {
                const runId = await createRun(run, { detectors: run.detectors });
                for (const detector of run.detectors) {
                    await updateRunDetector(
                        run.runNumber,
                        detector.RunDetectors.detectorId,
                        { quality: detector.RunDetectors.quality },
                    );
                }
                expectedRunNumbers.push(run.runNumber);

                // Create the expected EOR
                const eorReasons = [];
                for (const eorReason of run.eorReasons ?? []) {
                    eorReasons.push({ reasonTypeId: eorReason.reasonTypeId, description: eorReason.description, runId });
                }
                if (eorReasons.length > 0) {
                    await EorReasonRepository.addMany(eorReasons);
                }
            }
        }

        // Create the expected logs
        const logRuns = [];
        for (const log of customizedQcPdpEosReportLogs) {
            const logCreationRequest = {
                title: log.title,
                text: 'This is not important for test',
                createdAt: customizedQcPdpEosReport.shiftStart,
                subtype: 'comment',
                origin: 'human',
            };
            if (log.parentLogId) {
                logCreationRequest.parentLogId = log.parentLogId;
            }
            const logId = await createLog(logCreationRequest, [200], log.tags.map(({ text }) => text), []);
            logRuns.push({ logId, runId: 1 });
        }

        LogRunsRepository.bulkInsert(logRuns);

        const log = await eosReportService.createLogEntry(ShiftTypes.QC_PDP, customizedQcPdpEosReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedCustomizedQcPdpEosReport);
        expect(log.title).to.equal(eosQcPdpReportTitle);
        expect(log.tags.map(({ text }) => text)).to.have.members(getEosReportTagsByType(ShiftTypes.QC_PDP));
        expect(log.runs.map(({ runNumber }) => runNumber)).to.eql(expectedRunNumbers);
        expect(log.author.id).to.equal(1);
    });

    it('should successfully create a log containing QC/PDP EoS report with default values', async () => {
        await resetDatabaseContent();

        const log = await eosReportService.createLogEntry(ShiftTypes.QC_PDP, emptyQcPdpEosReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedEmptyQcPdpEosReport);
        expect(log.title).to.equal(eosQcPdpReportTitle);
        expect(log.runs.length).to.equal(0);
        expect(log.author.id).to.equal(1);
    });

    it('should successfully create a log containing SLIMOS EoS report', async () => {
        await resetDatabaseContent();

        // Create the expected logs
        for (const log of customizedSlimosEosReportLogs) {
            const logCreationRequest = {
                title: log.title,
                text: 'This is not important for test',
                createdAt: customizedSlimosEosReport.shiftStart,
                subtype: 'comment',
                origin: 'human',
            };
            if (log.parentLogId) {
                logCreationRequest.parentLogId = log.parentLogId;
            }
            await createLog(logCreationRequest, [], log.tags.map(({ text }) => text), []);
        }

        const log = await eosReportService.createLogEntry(ShiftTypes.SLIMOS, customizedSlimosEosReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedCustomizedSlimosEosReport);
        expect(log.title).to.equal(eosSlimosReportTitle);
        expect(log.tags.map(({ text }) => text)).to.have.members(getEosReportTagsByType(ShiftTypes.SLIMOS));
        expect(log.author.id).to.equal(1);
    });

    it('should successfully create a log containing SLIMOS EoS report with default values', async () => {
        await resetDatabaseContent();

        const log = await eosReportService.createLogEntry(ShiftTypes.SLIMOS, emptySlimosEosReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedEmptySlimosEosReport);
        expect(log.title).to.equal(eosSlimosReportTitle);
        expect(log.runs.length).to.equal(0);
        expect(log.author.id).to.equal(1);
    });

    it('should successfully create a log containing SL EoS report', async () => {
        await resetDatabaseContent();
        const expectedRunNumbers = [];

        // Create the expected logs and runs
        for (const runs of Object.values(customizedShiftLeaderEosReport.typeSpecific.runs)) {
            for (const run of runs) {
                await createRun(run, { detectors: run.detectors });
                for (const detector of run.detectors) {
                    await updateRunDetector(
                        run.runNumber,
                        detector.RunDetectors.detectorId,
                        { quality: detector.RunDetectors.quality },
                    );
                }
                expectedRunNumbers.push(run.runNumber);
            }
        }

        // Create the expected logs
        const logRuns = [];
        for (const log of customizedShiftLeaderEosReportLogs) {
            const logCreationRequest = {
                title: log.title,
                text: 'This is not important for test',
                createdAt: customizedShiftLeaderEosReport.shiftStart,
                subtype: 'comment',
                origin: 'human',
            };
            if (log.parentLogId) {
                logCreationRequest.parentLogId = log.parentLogId;
            }
            const logId = await createLog(logCreationRequest, [200], log.tags.map(({ text }) => text), []);
            logRuns.push({ logId, runId: 1 });
        }

        LogRunsRepository.bulkInsert(logRuns);

        const log = await eosReportService.createLogEntry(ShiftTypes.SL, customizedShiftLeaderEosReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedCustomizedShiftLeaderEosReport);
        expect(log.title).to.equal(eosShiftLeaderReportTitle);
        expect(log.tags.map(({ text }) => text)).to.have.members(getEosReportTagsByType(ShiftTypes.SL));
        expect(log.runs.map(({ runNumber }) => runNumber)).to.eql(expectedRunNumbers);
        expect(log.author.id).to.equal(1);
    });

    it('should successfully create a log containing Shift Leader EoS report with default values', async () => {
        await resetDatabaseContent();

        const log = await eosReportService.createLogEntry(ShiftTypes.SL, emptyShiftLeaderEosReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedEmptyShiftLeaderEosReport);
        expect(log.title).to.equal(eosShiftLeaderReportTitle);
        expect(log.runs.length).to.equal(0);
        expect(log.author.id).to.equal(1);
    });

    it('should successfully create a log containing DCS EoS report', async () => {
        await resetDatabaseContent();

        // Create the expected logs
        for (const log of customizedDcsEosReportLogs) {
            const logCreationRequest = {
                title: log.title,
                text: 'This is not important for test',
                createdAt: customizedDcsEosReport.shiftStart,
                subtype: 'comment',
                origin: 'human',
            };
            if (log.parentLogId) {
                logCreationRequest.parentLogId = log.parentLogId;
            }
            await createLog(logCreationRequest, [], log.tags.map(({ text }) => text), []);
        }

        const log = await eosReportService.createLogEntry(ShiftTypes.DCS, customizedDcsEosReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedCustomizedDcsEosReport);
        expect(log.title).to.equal(eosDcsReportTitle);
        expect(log.tags.map(({ text }) => text)).to.have.members(getEosReportTagsByType(ShiftTypes.DCS));
        expect(log.author.id).to.equal(1);
    });

    it('should successfully create a log containing DCS EoS report with default values', async () => {
        await resetDatabaseContent();

        const log = await eosReportService.createLogEntry(ShiftTypes.DCS, emptyDcsEosReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedEmptyDcsEosReport);
        expect(log.title).to.equal(eosDcsReportTitle);
        expect(log.runs.length).to.equal(0);
        expect(log.author.id).to.equal(1);
    });
};
