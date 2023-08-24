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
const { getShiftEnvironments } = require('../shift/getShiftEnvironments.js');
const { getEosReportTagsByType } = require('./eosTypeSpecificFormatter/getEosReportTagsByType.js');
const { ShiftTypes } = require('../../../domain/enums/ShiftTypes.js');
const { getShiftTagsFiltersByType } = require('../shift/getShiftTagsFiltersByType.js');
const { getShiftRuns } = require('../shift/getShiftRuns.js');
const { getShiftIssuesTagsOccurrences } = require('../log/getShiftIssuesTagsOccurrences.js');

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
 * @property {Log[]} issuesLogEntries
 * @property {EcsEosReportTypeSpecific|QcPdpEosReportTypeSpecific|ShiftLeaderEosReportTypeSpecific|null} typeSpecific
 * @property {string} shifterName
 * @property {string} [traineeName]
 * @property {string} [lhcTransitions]
 * @property {string} [shiftFlow]
 * @property {string} [infoFromPreviousShifter]
 * @property {string} [infoForNextShifter]
 * @property {string} [infoForRmRc]
 */

/**
 * @typedef EcsEosReportTypeSpecific
 * @property {SequelizeEnvironment[]} environments
 * @property {object} environmentComments
 * @property {object} runComments
 */

/**
 * @typedef QcPdpEosReportTypeSpecific
 * @property {Object<string, SequelizeRun[]>} runs
 * @property {object} runComments
 */

/**
 * @typedef EosReportMagnetInformation
 * @property {{solenoid: string, dipole: string}} start the magnet information at the start of the shift
 * @property {{timestamp: number, magnetConfiguration: {solenoid: string, dipole: string}}[]} intermediates the list of intermediates magnet
 *     configuration
 * @property {{solenoid: string, dipole: string}} end the magnet information at the end of the shift
 */

/**
 * @typedef ShiftLeaderEosReportTypeSpecific
 * @property {EosReportMagnetInformation} magnets magnet information at the start and the end of the shift
 * @property {number} efficiency efficiency of the shift
 * @property {SequelizeLog[]} shiftIssues the list of issues created during the shift relevant for ShiftLeader logs' tags counter
 * @property {Object<string, SequelizeRun[]>} runs list of runs in the shifts, grouped by definition
 */

/**
 * @typedef DcsEosReportTypeSpecific
 * @property {string} alerts the DCS alerts concatenated
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
     * @param {UserIdentifier} currentUserIdentifier the identifier of the current user creating the EOS report
     * @return {Promise<Log>} resolves with the created log entry
     */
    async createLogEntry(reportType, reportCreationRequest, currentUserIdentifier) {
        const currentUser = await getUserOrFail(currentUserIdentifier);
        const shift = getShiftFromTimestamp(reportCreationRequest.shiftStart);
        const shiftIssues = await getShiftIssues(shift, getShiftTagsFiltersByType(reportType));

        /**
         * @type {Partial<EosReport>}
         */
        const eosReport = {
            type: reportType,
            shiftStart: reportCreationRequest.shiftStart,
            shifterName: reportCreationRequest.shifterName,
            traineeName: reportCreationRequest.traineeName,
            issuesLogEntries: shiftIssues,
            lhcTransitions: reportCreationRequest.lhcTransitions,
            shiftFlow: reportCreationRequest.shiftFlow,
            infoFromPreviousShifter: reportCreationRequest.infoFromPreviousShifter,
            infoForNextShifter: reportCreationRequest.infoForNextShifter,
            infoForRmRc: reportCreationRequest.infoForRmRc,
        };

        let logRunNumbers = [];
        switch (reportType) {
            case ShiftTypes.ECS:
                eosReport.typeSpecific = {
                    ...await getEcsSpecificReportData(shift),
                    environmentComments: reportCreationRequest.typeSpecific.environmentComments,
                    runComments: reportCreationRequest.typeSpecific.runComments,
                };
                // Duplicate looping (not many values in array) is worth the price of code complexity
                logRunNumbers = eosReport.typeSpecific.environments.map(({ runs }) => runs.map(({ runNumber }) => runNumber)).flat();
                break;
            case ShiftTypes.QC_PDP:
                eosReport.typeSpecific = {
                    ...await getQcPdpSpecificReportData(shift),
                    runComments: reportCreationRequest.typeSpecific.runComments,
                };
                // Duplicate looping (not many values in array) is worth the price of code complexity
                logRunNumbers = Object.values(eosReport.typeSpecific.runs).map((runs) => runs.map(({ runNumber }) => runNumber)).flat();
                break;
            case ShiftTypes.SL:
                eosReport.typeSpecific = {
                    ...await getShiftLeaderSpecificReportData(shift),
                    magnets: reportCreationRequest.typeSpecific.magnets,
                };
                // Duplicate looping (not many values in array) is worth the price of code complexity
                logRunNumbers = Object.values(eosReport.typeSpecific.runs).map((runs) => runs.map(({ runNumber }) => runNumber)).flat();
                break;
            case ShiftTypes.DCS:
                eosReport.typeSpecific = {
                    alerts: reportCreationRequest.typeSpecific.alerts,
                };
                break;
        }

        const report = await formatEosReport(eosReport);

        return logService.create(
            {
                userId: currentUser.id,
                title: report.substring(2, report.indexOf('\n')),
                text: report,
                subtype: 'comment',
                origin: 'process',
            },
            logRunNumbers,
            // Use only existing tags
            (await getTagsByText(getEosReportTagsByType(reportType))).map(({ text }) => text),
        );
    }
}

/**
 * Returns the ECS-specific report data
 *
 * @param {Shift} shift the shift for which data should be fetched
 * @return {Promise<EcsEosReportTypeSpecific>} the ECS EOS report type specific
 */
const getEcsSpecificReportData = async (shift) => ({
    environments: await getShiftEnvironments(shift, ShiftTypes.ECS),
});

/**
 * Returns the QC/PDP-specific report data
 *
 * @param {Shift} shift the shift for which data should be fetched
 * @return {Promise<QcPdpEosReportTypeSpecific>} the QC/PDP report type specific
 */
const getQcPdpSpecificReportData = async (shift) => ({
    runs: await getShiftRuns(shift, ShiftTypes.QC_PDP),
});

/**
 * Returns the SL-specific report data
 *
 * @param {Shift} shift the shift for which data should be fetched
 * @return {Promise<ShiftLeaderEosReportTypeSpecific>} the Shift Leader report type specific
 */
const getShiftLeaderSpecificReportData = async (shift) => ({
    tagsCounters: await getShiftIssuesTagsOccurrences(shift),
    runs: await getShiftRuns(shift, ShiftTypes.SL),
});

exports.EosReportService = EosReportService;

exports.eosReportService = new EosReportService();
