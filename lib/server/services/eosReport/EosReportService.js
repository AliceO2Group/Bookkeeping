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
const { getShiftFromTimestamp } = require('./getShiftFromTimestamp.js');
const { getLogsByTagsInPeriod } = require('../log/getLogsByTagsInPeriod.js');
const { logService } = require('../log/LogService.js');
const { getLogsByUserInPeriod } = require('../log/getLogsByUserInPeriod.js');

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
 * @property {string} [traineeName]
 * @property {string} [issuesBlock]
 * @property {string} [shiftFlow]
 * @property {string} [infoFromPreviousShifter
 * @property {string} [infoForNextShifter]
 * @property {string} [infoForRmRc]
 */

/**
 * Service to generate end of shift report
 */
class EosReportService {
    /**
     * Constructor
     */
    constructor() {
        this._issuesLogEntriesTags = ['DCS', 'ECS', 'QC/PDP', 'SL', 'SLIMOS'];
    }

    /**
     * Create an end of shift report log
     *
     * @param {string} reportType the type of EOS report
     * @param {EosReportCreationRequest} reportCreationRequest the data of the EOS report
     * @param {UserIdentifier} shifterUserIdentifier the shifter creatiing the EOS report
     * @return {Promise<number>} resolves with the created log entry
     */
    async createLogEntry(reportType, reportCreationRequest, shifterUserIdentifier) {
        const shifter = await getUserOrFail(shifterUserIdentifier);
        const shift = getShiftFromTimestamp(reportCreationRequest.shiftStart);

        const issuesLogEntriesByUser = await getLogsByUserInPeriod(shifter, { from: shift.start, to: shift.end }, { tags: true });

        /**
         * List of entries with at least  tag DCS / ECS / "QC/PDP" / SL / SLIMOS sorted by tags - Title of the entry - Link
         */
        const issuesLogEntriesByTag = (await getLogsByTagsInPeriod(this._issuesLogEntriesTags, { from: shift.start, to: shift.end }))
            .filter((log) => !issuesLogEntriesByUser.some((userLog) => userLog.id === log.id));

        const report = await formatEosReport({
            type: reportType,
            shiftStart: reportCreationRequest.shiftStart,
            shifter,
            traineeName: reportCreationRequest.traineeName,
            issuesBlock: reportCreationRequest.issuesBlock,
            issuesLogEntries: [...issuesLogEntriesByUser, ...issuesLogEntriesByTag],
            shiftFlow: reportCreationRequest.shiftFlow,
            infoFromPreviousShifter: reportCreationRequest.infoFromPreviousShifter,
            infoForNextShifter: reportCreationRequest.infoForNextShifter,
            infoForRmRc: reportCreationRequest.infoForRmRc,
        });

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

    /**
     * Defines the tags to use to fetch EOS report's issues logs
     *
     * @param {string[]} tagTexts the tags to use
     */
    set issuesLogEntriesTags(tagTexts) {
        this._issuesLogEntriesTags = tagTexts;
    }
}

exports.EosReportService = EosReportService;

exports.eosReportService = new EosReportService();
