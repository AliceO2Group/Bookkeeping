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

const customizedECSEorReport = {
    type: ShiftTypes.ECS,
    typeSpecific: {
        environments: [],
    },
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
            tags: [{ text: 'ECS' }],
            user: { id: 1 },
        },
        {
            title: 'Fourth issue log',
            tags: [{ text: 'TEST-TAG-26' }],
            user: { id: 1 },
        },
        {
            title: 'First issue log',
            tags: [{ text: 'TEST' }, { text: 'DCS' }],
        },
        {
            title: 'Second issue log',
            tags: [{ text: 'SL' }],
        },
    ],
    infoFromPreviousShifter: 'Info from\nprevious shifter',
    infoForNextShifter: 'Info for\nnext shifter',
    infoForRmRc: 'Info for\nRM and RC',
};

exports.customizedECSEorReport = customizedECSEorReport;

exports.customizedECSEorReportRequest = {
    typeSpecific: null,
    traineeName: customizedECSEorReport.traineeName,
    shiftStart: customizedECSEorReport.shiftStart,
    shiftFlow: customizedECSEorReport.shiftFlow,
    issuesBlock: customizedECSEorReport.issuesBlock,
    infoFromPreviousShifter: customizedECSEorReport.infoFromPreviousShifter,
    infoForNextShifter: customizedECSEorReport.infoForNextShifter,
    infoForRmRc: customizedECSEorReport.infoForRmRc,
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
- \\[ECS\\] - [Third issue log](#)
- \\[TEST-TAG-26\\] - [Fourth issue log](#)
- \\[TEST, DCS\\] - [First issue log](#)
- \\[SL\\] - [Second issue log](#)

## LHC
* LHC (list all machine transitions) (in the future this section will be automatically filled)
   * TIME STAMP - MACHINE MODE : BEAM MODE
   * TIME STAMP - Fill numbers 

## Shift flow
The
shift flow

## Environments and runs
-

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

const emptyECSEorReport = {
    type: ShiftTypes.ECS,
    shifter: {
        name: 'John Doe',
    },
    shiftStart: MORNING_SHIFT_START,
    issuesLogEntries: [],
    typeSpecific: {
        environments: [],
    },
};

exports.emptyECSEorReport = emptyECSEorReport;

exports.formattedEmptyECSEorReport = `\
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

## Environments and runs
-

## Shift to shift transfer of information

### From previous shifter
-

### For next shifter
-

### For RM/RC
-\
`;

exports.emptyECSEorReportRequest = {
    typeSpecific: null,
    shiftStart: emptyECSEorReport.shiftStart,
};
