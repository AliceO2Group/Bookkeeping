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

const { getShiftFromTimestamp, SHIFTER_TIMEZONE } = require('../shift/getShiftFromTimestamp.js');
const { formatEcsEosReportTypeSpecific } = require('./eosTypeSpecificFormatter/formatEcsEosReportTypeSpecific.js');
const { SERVER_DATE_FORMAT } = require('../../utilities/formatServerDate.js');
const { ShiftTypes } = require('../../../domain/enums/ShiftTypes.js');
const { formatQcPdpEosReportTypeSpecific } = require('./eosTypeSpecificFormatter/formatQcPdpEosReportTypeSpecific.js');
const { eosReportFormatLog } = require('./formatters.js');
const { formatShiftLeaderEosReportTypeSpecific } = require('./eosTypeSpecificFormatter/formatShiftLeaderEosReportTypeSpecific.js');
const { formatDcsEosReportTypeSpecific } = require('./eosTypeSpecificFormatter/formatDcsEosReportTypeSpecific.js');

/**
 * Create an EoS report title
 *
 * @param {Shift} shift the shift
 * @param {String} shiftType the shift type
 * @returns {String} the formatted title
 */
exports.formatEosReportTitle = (shift, shiftType) => {
    const formattedShiftDate = new Date(shift.start).toLocaleDateString(SERVER_DATE_FORMAT, { timeZone: SHIFTER_TIMEZONE });
    const title = `End of shift report - ${shiftType} - ${formattedShiftDate} ${shift.period}`;
    return title;
};

/**
 * Create an EOS report
 *
 * @param {EosReport} eosReport the EOS report to format
 * @return {Promise<string>} resolves with the formatted EOS report
 */
exports.formatEosReport = async (eosReport) => {
    const shift = getShiftFromTimestamp(eosReport.shiftStart);
    const title = this.formatEosReportTitle(shift, eosReport.type);

    const formattedIssuesLogs = eosReport.issuesLogEntries.length > 0
        ? eosReport.issuesLogEntries.map((log) => `- ${eosReportFormatLog(log)}`).join('\n')
        : '-';

    let formattedEosReport = formatCommonEOSReportStart(
        title,
        eosReport.shifterName,
        eosReport.traineeName,
        formattedIssuesLogs,
        eosReport.lhcTransitions,
        eosReport.shiftFlow,
    );

    let specificReportPart;
    switch (eosReport.type) {
        case ShiftTypes.ECS:
            specificReportPart = await formatEcsEosReportTypeSpecific(eosReport.typeSpecific);
            break;
        case ShiftTypes.QC_PDP:
            specificReportPart = await formatQcPdpEosReportTypeSpecific(eosReport.typeSpecific);
            break;
        case ShiftTypes.SL:
            specificReportPart = await formatShiftLeaderEosReportTypeSpecific(shift, eosReport);
            break;
        case ShiftTypes.DCS:
            specificReportPart = formatDcsEosReportTypeSpecific(eosReport.typeSpecific);
            break;
        default:
            specificReportPart = null;
    }
    formattedEosReport += specificReportPart ? `\n\n${specificReportPart}\n` : '\n';

    formattedEosReport += formatCommonEOSReportEndTemplate(
        eosReport.infoFromPreviousShifter,
        eosReport.infoForNextShifter,
        eosReport.infoForRmRc,
    );

    return formattedEosReport;
};

/**
 * Format the common start of the end of shift report
 *
 * @param {string} title the title of the report
 * @param {string} shifterName the name of the shifter
 * @param {string|undefined} shifterTraineeName the name of the shifter's trainee
 * @param {string} formattedIssuesLogs the formatted logs list considered as related to the shift
 * @param {string} lhcTransitions the lhc machine transitions provided by the shifter (as markdown)
 * @param {string} shiftFlow the shift flow provided by the shifter (as markdown)
 * @return {string} the start of EOS report
 */
const formatCommonEOSReportStart = (title, shifterName, shifterTraineeName, formattedIssuesLogs, lhcTransitions, shiftFlow) => `\
# ${title}
- shifter: ${shifterName}
- trainee: ${shifterTraineeName ?? '-'}

## Issues during the shift
${formattedIssuesLogs}

## LHC
${lhcTransitions ?? '-'}

## Shift flow
${shiftFlow ?? '-'}\
`;

/**
 * Format the common end of the end of shift report
 *
 * @param {string} infoFromPreviousShifter info from previous shifter provided by the shifter
 * @param {string} infoForNextShifter info for the next shifter provided by the shifter
 * @param {string} infoForRmRc info for the RM and RC provided by the shifter
 * @return {string} the end of the EOS report
 */
const formatCommonEOSReportEndTemplate = (infoFromPreviousShifter, infoForNextShifter, infoForRmRc) => `
## Shift to shift transfer of information

### From previous shifter
${infoFromPreviousShifter ?? '-'}

### For next shifter
${infoForNextShifter ?? '-'}

### For RM/RC
${infoForRmRc ?? '-'}\
`;
