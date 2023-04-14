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
const { formatEosReport } = require('./formatEosReport.js');
const { getUserOrFail } = require('../user/getUserOrFail.js');
const { getTagsByText } = require('../tag/getTagsByText.js');
const { getShiftFromTimestamp } = require('../shift/getShiftFromTimestamp.js');
const { logService } = require('../log/LogService.js');
const { getShiftIssues } = require('./getShiftIssues.js');
const { shiftService } = require('../shift/ShiftService.js');
const { getShiftEnvironments } = require('../shift/getShiftEnvironments.js');

/**
 * @typedef Shift
 * @property {number} start the start of the shift (UNIX timestamp in ms)
 * @property {number} end the end of the shift (UNIX timestamp in ms)
 * @property {'Morning'|'Afternoon'|'Night'} period the period of the shift
 */

/**
 * @typedef EosReport
 * @property {string} type
 * @property {number} shiftStart start of the shift (UNIX timestamp in ms)
 * @property {User} shifter
 * @property {Log[]} issuesLogEntries
 * @property {EcsEosReportTypeSpecific|null} typeSpecific
 * @property {string} [traineeName]
 * @property {string} [issuesBlock]
 * @property {string} [shiftFlow]
 * @property {string} [infoFromPreviousShifter
 * @property {string} [infoForNextShifter]
 * @property {string} [infoForRmRc]
 */

/**
 * @typedef EcsEosReportTypeSpecific
 * @property {SequelizeEnvironment[]} environments
 */

/**
 * Service to generate end of shift report
 */
class EosReportService {
    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * Create an end of shift report log
     *
     * @param {string} reportType the type of EOS report
     * @param {EosReportCreationRequest} reportCreationRequest the data of the EOS report
     * @param {UserIdentifier} shifterUserIdentifier the shifter creating the EOS report
     * @return {Promise<number>} resolves with the created log entry
     */
    async createLogEntry(reportType, reportCreationRequest, shifterUserIdentifier) {
        const shifter = await getUserOrFail(shifterUserIdentifier);
        const shift = getShiftFromTimestamp(reportCreationRequest.shiftStart);
        const shiftIssues = await getShiftIssues(shift, shifter, shiftService.issuesLogEntriesTags);

        /**
         * @type {Partial<EosReport>}
         */
        const eosReport = {
            type: reportType,
            shiftStart: reportCreationRequest.shiftStart,
            shifter,
            traineeName: reportCreationRequest.traineeName,
            issuesBlock: reportCreationRequest.issuesBlock,
            issuesLogEntries: shiftIssues,
            shiftFlow: reportCreationRequest.shiftFlow,
            infoFromPreviousShifter: reportCreationRequest.infoFromPreviousShifter,
            infoForNextShifter: reportCreationRequest.infoForNextShifter,
            infoForRmRc: reportCreationRequest.infoForRmRc,
        };

        switch (reportType) {
            case 'ECS':
                eosReport.typeSpecific = await getEcsSpecificReportData(shift);
                break;
        }

        const report = await formatEosReport(eosReport);

        return logService.create(
            {
                title: report.substring(2, report.indexOf('\n')),
                text: report,
                subtype: 'comment',
                origin: 'process',
            },
            [],
            // Use only existing tags
            (await getTagsByText(['EoS', reportType])).map(({ text }) => text),
        );
    }
}

/**
 * Returns the ECS-specific report data
 *
 * @param {Shift} shift the shift for which data should be fetched
 * @return {EcsEosReportTypeSpecific} the ecs EOS report type specific
 */
const getEcsSpecificReportData = async (shift) => ({
    environments: await getShiftEnvironments(shift),
});

exports.EosReportService = EosReportService;

exports.eosReportService = new EosReportService();
