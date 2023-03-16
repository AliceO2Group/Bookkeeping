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
    formattedCustomizedEorReport, customizedEorReport,
} = require('../../../../mocks/mock-eos-report.js');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { createLog } = require('../../../../../lib/server/services/log/createLog.js');

module.exports = () => {
    it('should successfully create a log containing EOS report', async () => {
        eosReportService.issuesLogEntriesTags = ['FOOD', 'TEST', 'OTHER'];

        // Create the expected logs
        for (const log of customizedEorReport.issuesLogEntries) {
            await createLog({
                title: log.title,
                text: log.text,
                createdAt: customizedEorReport.shiftStart,
                subtype: 'comment',
                origin: 'human',
            }, [], log.tags.map(({ text }) => text), []);
        }

        const log = await eosReportService.createLogEntry('ECS', customizedEorReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedCustomizedEorReport);
    });

    it('should successfully create a log containing EOS report with default values', async () => {
        await resetDatabaseContent();

        const log = await eosReportService.createLogEntry('ECS', emptyEorReportRequest, { userId: 1 });
        expect(log.text).to.equal(formattedEmptyEorReport);
    });
};
