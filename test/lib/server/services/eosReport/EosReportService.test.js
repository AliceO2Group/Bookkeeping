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
    formattedEmptyEorReport,
    emptyEorReportRequest,
    customizedEorReportRequest,
    formattedCustomizedEorReport, customizedEorReport, eosReportTitle,
} = require('../../../../mocks/mock-eos-report.js');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { createLog } = require('../../../../../lib/server/services/log/createLog.js');
const { ShiftTypes } = require('../../../../../lib/domain/enums/ShiftTypes.js');
const { shiftService } = require('../../../../../lib/server/services/shift/ShiftService.js');

module.exports = () => {
    it('should successfully create a log containing EOS report', async () => {
        // Create the expected logs
        for (const log of customizedEorReport.issuesLogEntries) {
            const logCreationRequest = {
                title: log.title,
                text: 'This is not important for test',
                createdAt: customizedEorReport.shiftStart,
                subtype: 'comment',
                origin: 'human',
            };
            if (log.user) {
                logCreationRequest.userId = log.user.id;
            }
            await createLog(logCreationRequest, [], log.tags.map(({ text }) => text), []);
        }

        const log = await eosReportService.createLogEntry(ShiftTypes.ECS, customizedEorReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedCustomizedEorReport);
        expect(log.title).to.equal(eosReportTitle);
    });

    it('should successfully create a log containing EOS report with default values', async () => {
        await resetDatabaseContent();

        const log = await eosReportService.createLogEntry(ShiftTypes.ECS, emptyEorReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedEmptyEorReport);
        expect(log.title).to.equal(eosReportTitle);
    });
};
