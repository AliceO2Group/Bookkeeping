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

const { formatShiftDate } = require('../../lib/server/services/shift/formatShiftDate');
const { getShiftFromTimestamp } = require('../../lib/server/services/shift/getShiftFromTimestamp');

// 2023-03-17 07:00:00 geneva time
const MORNING_SHIFT_START = 1679032800000;

const genericCustomizedEosReport = {
    shifterName: 'John Doe',
    traineeName: 'Trainee',
    shiftStart: MORNING_SHIFT_START,
    shiftFlow: 'The\nshift flow',
    lhcTransitions: 'The\nLHC machine transitions',
    infoFromPreviousShifter: 'Info from\nprevious shifter',
    infoForNextShifter: 'Info for\nnext shifter',
    infoForRmRc: 'Info for\nRM and RC',
};

exports.genericCustomizedEosReport = genericCustomizedEosReport;

exports.genericFormattedCustomizedEosReport = (reportType, formattedLogs, formattedTypeSpecific) => `\
# End of shift report - ${reportType} - 17/03/2023 Morning
- shifter: John Doe
- trainee: Trainee

## Issues during the shift
${formattedLogs}

## LHC
The
LHC machine transitions

## Shift flow
The
shift flow
${formattedTypeSpecific}
## Shift to shift transfer of information

### From previous shifter
Info from
previous shifter

### For next shifter
Info for
next shifter

### For RM/RC
Info for
RM and RC\
`;

exports.genericCustomizedEosReportRequest = {
    shifterName: genericCustomizedEosReport.shifterName,
    traineeName: genericCustomizedEosReport.traineeName,
    shiftStart: genericCustomizedEosReport.shiftStart,
    shiftFlow: genericCustomizedEosReport.shiftFlow,
    lhcTransitions: genericCustomizedEosReport.lhcTransitions,
    infoFromPreviousShifter: genericCustomizedEosReport.infoFromPreviousShifter,
    infoForNextShifter: genericCustomizedEosReport.infoForNextShifter,
    infoForRmRc: genericCustomizedEosReport.infoForRmRc,
};

// eslint-disable-next-line require-jsdoc
const genericCustomTimeEosReport = (time, information) => ({
    shifterName: 'Anon Y. Mouse',
    traineeName: 'Trainee II',
    shiftStart: time,
    shiftFlow: 'The\nshift flow',
    lhcTransitions: 'The\nLHC machine transitions',
    infoFromPreviousShifter: 'Info from\nprevious shifter',
    infoForNextShifter: information,
    infoForRmRc: 'Info for\nRM and RC',
});

exports.genericCustomTimeEosReport = genericCustomTimeEosReport;

exports.genericFormattedCustomTimeEosReport = (reportType, formattedTypeSpecific, time, information) => {
    const shift = getShiftFromTimestamp(time);
    const formattedDate = formatShiftDate(shift.start, { date: true, time: false });
    return `\
# End of shift report - ${reportType} - ${formattedDate} ${shift.period}
- shifter: Anon Y. Mouse
- trainee: Trainee II

## Issues during the shift
-

## LHC
The
LHC machine transitions

## Shift flow
The
shift flow
${formattedTypeSpecific}
## Shift to shift transfer of information

### From previous shifter
Info from
previous shifter

### For next shifter
${information}

### For RM/RC
Info for
RM and RC\
`;
};

exports.genericCustomTimeEosReportRequest = (time, information) => ({
    shifterName: genericCustomTimeEosReport(time, information).shifterName,
    traineeName: genericCustomTimeEosReport(time, information).traineeName,
    shiftStart: genericCustomTimeEosReport(time, information).shiftStart,
    shiftFlow: genericCustomTimeEosReport(time, information).shiftFlow,
    lhcTransitions: genericCustomTimeEosReport(time, information).lhcTransitions,
    infoFromPreviousShifter: genericCustomTimeEosReport(time, information).infoFromPreviousShifter,
    infoForNextShifter: genericCustomTimeEosReport(time, information).infoForNextShifter,
    infoForRmRc: genericCustomTimeEosReport(time, information).infoForRmRc,
});

const genericEmptyEosReport = {
    shifterName: 'John Doe',
    shiftStart: MORNING_SHIFT_START,
    issuesLogEntries: [],
};

exports.genericEmptyEosReport = genericEmptyEosReport;

exports.genericFormattedEmptyEosReport = (reportType, formattedTypeSpecific) => `\
# End of shift report - ${reportType} - 17/03/2023 Morning
- shifter: John Doe
- trainee: -

## Issues during the shift
-

## LHC
-

## Shift flow
-
${formattedTypeSpecific}
## Shift to shift transfer of information

### From previous shifter
-

### For next shifter
-

### For RM/RC
-\
`;

exports.genericEmptyEosReportRequest = {
    shiftStart: genericEmptyEosReport.shiftStart,
    shifterName: genericEmptyEosReport.shifterName,
};
