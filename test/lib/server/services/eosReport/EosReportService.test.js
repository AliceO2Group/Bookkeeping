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
    emptyECSEorReportRequest,
    formattedCustomizedEorReport,
    customizedECSEorReport,
    eosReportTitle,
    customizedECSEorReportRequest,
    formattedEmptyECSEorReport, customizedEcsEorReportLogs,
} = require('../../../../mocks/mock-eos-report.js');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { createLog } = require('../../../../../lib/server/services/log/createLog.js');
const { ShiftTypes } = require('../../../../../lib/domain/enums/ShiftTypes.js');
const { LogRunsRepository } = require('../../../../../lib/database/repositories/index.js');
const { createEnvironment } = require('../../../../../lib/server/services/environment/createEnvironment.js');
const { createEnvironmentHistoryItem } = require('../../../../../lib/server/services/environmentHistoryItem/createEnvironmentHistoryItem.js');
const { createRun } = require('../../../../../lib/server/services/run/createRun.js');
const { getOrCreateAllDetectorsByName } = require('../../../../../lib/server/services/detector/getOrCreateAllDetectorsByName.js');
const EorReasonRepository = require('../../../../../lib/database/repositories/EorReasonRepository.js');
const { getEosReportTagsByType } = require('../../../../../lib/server/services/eosReport/eosTypeSpecificFormatter/getEosReportTagsByType.js');

module.exports = () => {
    it('should successfully create a log containing EOS report', async () => {
        // Create the expected logs and runs
        for (const environment of customizedECSEorReport.typeSpecific.environments) {
            await createEnvironment(environment);
            await createEnvironmentHistoryItem({
                status: 'DESTROYED',
                createdAt: environment.createdAt,
                updatedAt: environment.updatedAt,
                environmentId: environment.id,
            });
            for (const run of environment.runs) {
                const runId = await createRun(
                    run,
                    await getOrCreateAllDetectorsByName((run?.concatenatedDetectors ?? '').split(',').map((value) => value.trim())),
                );

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
        for (const log of customizedEcsEorReportLogs) {
            const logCreationRequest = {
                title: log.title,
                text: 'This is not important for test',
                createdAt: customizedECSEorReport.shiftStart,
                subtype: 'comment',
                origin: 'human',
            };
            if (log.user) {
                logCreationRequest.userId = log.user.id;
            }
            const logId = await createLog(logCreationRequest, [200], log.tags.map(({ text }) => text), []);
            logRuns.push({ logId, runId: 1 });
        }

        LogRunsRepository.bulkInsert(logRuns);

        const log = await eosReportService.createLogEntry(ShiftTypes.ECS, customizedECSEorReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedCustomizedEorReport);
        expect(log.title).to.equal(eosReportTitle);
        expect(log.tags.map(({ text }) => text)).to.have.members(getEosReportTagsByType(ShiftTypes.ECS));
    });

    it('should successfully create a log containing EOS report with default values', async () => {
        await resetDatabaseContent();

        const log = await eosReportService.createLogEntry(ShiftTypes.ECS, emptyECSEorReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedEmptyECSEorReport);
        expect(log.title).to.equal(eosReportTitle);
    });
};
