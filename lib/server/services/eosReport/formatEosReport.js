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

const { SERVER_DATE_FORMAT, SERVER_DATE_LOCALE_OPTIONS } = require('../../utilities/formatServerDate.js');
const { getShiftFromTimestamp } = require('../shift/getShiftFromTimestamp.js');
const { formatEcsEosReportTypeSpecific } = require('./eosTypeSpecificFormatter/formatEcsEosReportTypeSpecific.js');
const { frontUrl } = require('../../../utilities/frontUrl.js');

/**
 * Create an EOS report
 *
 * @param {EosReport} eosReport the EOS report to format
 * @return {Promise<string>} resolves with the formatted EOS report
 */
exports.formatEosReport = async (eosReport) => {
    const shift = getShiftFromTimestamp(eosReport.shiftStart);

    const formattedShiftDate = new Date(shift.start).toLocaleDateString(SERVER_DATE_FORMAT, SERVER_DATE_LOCALE_OPTIONS);

    const title = `End of shift report - ${eosReport.type} - ${formattedShiftDate} ${shift.period}`;

    const shifterName = eosReport.shifter.name;

    const formattedIssuesLogs = eosReport.issuesLogEntries.length > 0
        ? eosReport.issuesLogEntries.map((log) => {
            const formattedTags = log.tags.length > 0 ? log.tags.map(({ text }) => text).join(', ') : '**no tags**';
            return `- \\[${formattedTags}\\] - [${log.title}](${frontUrl({ page: 'log-detail', id: log.id })})`;
        }).join('\n')
        : '-';

    let formattedEosReport = formatCommonEOSReportStart(
        title,
        shifterName,
        eosReport.traineeName,
        eosReport.issuesBlock,
        formattedIssuesLogs,
        eosReport.shiftFlow,
    );

    let specificReportPart;
    switch (eosReport.type) {
        case 'ECS':
            specificReportPart = await formatEcsEosReportTypeSpecific(eosReport.typeSpecific);
            break;
        default:
            specificReportPart = null;
    }
    formattedEosReport += specificReportPart ? `\n\n${specificReportPart}\n` : null;

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
 * @param {string} issuesBlock the issuesBlock summary provided by the shifter
 * @param {string} formattedIssuesLogs the formatted logs list considered as related to issuesBlock
 * @param {string} shiftFlow the shift flow provided by the shifter (as markdown)
 * @return {string} the start of EOS report
 */
const formatCommonEOSReportStart = (title, shifterName, shifterTraineeName, issuesBlock, formattedIssuesLogs, shiftFlow) => `\
# ${title}
- shifter: ${shifterName}
- trainee: ${shifterTraineeName ?? '-'}

## Issues during the shift

### Summary
${issuesBlock ?? '-'}

### Issues entries
${formattedIssuesLogs}

## LHC
* LHC (list all machine transitions) (in the future this section will be automatically filled)
   * TIME STAMP - MACHINE MODE : BEAM MODE
   * TIME STAMP - Fill numbers 

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
