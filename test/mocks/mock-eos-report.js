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
const { ShiftTypes } = require('../../lib/domain/enums/ShiftTypes.js');

// 2023-03-17 07:00:00 geneva time
const MORNING_SHIFT_START = 1679032800000;

exports.eosReportTitle = 'End of shift report - ECS - 3/17/2023 Morning';

const customizedEorReport = {
    type: ShiftTypes.ECS,
    typeSpecific: null,
    shifter: {
        name: 'John Doe',
    },
    traineeName: 'Trainee',
    shiftStart: MORNING_SHIFT_START,
    shiftFlow: 'The\nshift flow',
    issuesBlock: 'A\nlist\nof issues',
    issuesLogEntries: [
        {
            title: 'Third issue log',
            text: 'This is not important for test',
            tags: [{ text: 'FOOD' }],
            user: { id: 1 },
        },
        {
            title: 'Fourth issue log',
            text: 'This is not important for test',
            tags: [{ text: 'TEST-TAG-1' }],
            user: { id: 1 },
        },
        {
            title: 'First issue log',
            text: 'This is not important for test',
            tags: [{ text: 'FOOD' }, { text: 'TEST' }],
        },
        {
            title: 'Second issue log',
            text: 'This is not important for test',
            tags: [{ text: 'OTHER' }],
        },
    ],
    infoFromPreviousShifter: 'Info from\nprevious shifter',
    infoForNextShifter: 'Info for\nnext shifter',
    infoForRmRc: 'Info for\nRM and RC',
};

exports.customizedEorReport = customizedEorReport;

exports.customizedEorReportRequest = {
    typeSpecific: customizedEorReport.typeSpecific,
    traineeName: customizedEorReport.traineeName,
    shiftStart: customizedEorReport.shiftStart,
    shiftFlow: customizedEorReport.shiftFlow,
    issuesBlock: customizedEorReport.issuesBlock,
    infoFromPreviousShifter: customizedEorReport.infoFromPreviousShifter,
    infoForNextShifter: customizedEorReport.infoForNextShifter,
    infoForRmRc: customizedEorReport.infoForRmRc,
};

exports.formattedCustomizedEorReport = `\
# End of shift report - ECS - 3/17/2023 Morning
- shifter: John Doe
- trainee: Trainee

## Issues during the shift

### Summary
A
list
of issues

### Issues entries
- \\[FOOD\\] - [Third issue log](#)
- \\[TEST-TAG-1\\] - [Fourth issue log](#)
- \\[FOOD, TEST\\] - [First issue log](#)
- \\[OTHER\\] - [Second issue log](#)

## LHC
* LHC (list all machine transitions) (in the future this section will be automatically filled)
   * TIME STAMP - MACHINE MODE : BEAM MODE
   * TIME STAMP - Fill numbers 

## Shift flow
The
shift flow

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

const emptyEorReport = {
    type: ShiftTypes.ECS,
    shifter: {
        name: 'John Doe',
    },
    shiftStart: MORNING_SHIFT_START,
    issuesLogEntries: [],
    typeSpecific: null,
};

exports.emptyEorReport = emptyEorReport;

exports.formattedEmptyEorReport = `\
# End of shift report - ECS - 3/17/2023 Morning
- shifter: John Doe
- trainee: -

## Issues during the shift

### Summary
-

### Issues entries
-

## LHC
* LHC (list all machine transitions) (in the future this section will be automatically filled)
   * TIME STAMP - MACHINE MODE : BEAM MODE
   * TIME STAMP - Fill numbers 

## Shift flow
-

## Shift to shift transfer of information

### From previous shifter
-

### For next shifter
-

### For RM/RC
-\
`;

exports.emptyEorReportRequest = {
    typeSpecific: emptyEorReport.typeSpecific,
    shiftStart: emptyEorReport.shiftStart,
};
