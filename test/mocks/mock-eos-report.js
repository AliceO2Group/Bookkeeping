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

exports.eosReportTitle = 'End of shift report - ECS - 17/03/2023 Morning';

const customizedEcsEorReportLogs = [
    {
        id: 120,
        title: 'Third issue log',
        tags: [{ text: 'ECS Shifter' }],
        user: { id: 1 },
    },
    {
        id: 121,
        title: 'Fourth issue log',
        tags: [{ text: 'TEST-TAG-26' }, { text: 'ECS Shifter' }, { text: 'EoS' }],
        user: { id: 1 },
    },
    {
        id: 122,
        title: 'First issue log',
        tags: [{ text: 'TEST' }, { text: 'DCS' }],
    },
    {
        id: 123,
        title: 'Second issue log',
        tags: [{ text: 'SL' }],
    },
    {
        id: 124,
        title: 'Fifth issue log',
        tags: [{ text: 'ECS Shifter' }, { text: 'FLP' }],
    },
];

exports.customizedEcsEorReportLogs = customizedEcsEorReportLogs;

const customizedECSEorReport = {
    type: ShiftTypes.ECS,
    typeSpecific: {
        environments: [
            {
                id: 'ENV1',
                createdAt: new Date('2023-03-17T08:13:03Z'),
                updatedAt: new Date('2023-03-17T08:13:03Z'),
                runs: [
                    {
                        id: 108,
                        timeTrgStart: new Date('2023-03-17T08:14:03Z'),
                        timeTrgEnd: new Date('2023-03-17T09:16:06Z'),
                        runDuration: (3600 + 2 * 60 + 3) * 1000,
                        envId: 'ENV1',
                        runNumber: 200,
                        runQuality: 'good',
                        eorReasons: [
                            {
                                reasonTypeId: 1,
                                reasonType: { category: 'DETECTORS', title: 'CPV' },
                                description: 'EOR description',
                            },
                            {
                                reasonTypeId: 2,
                                reasonType: { category: 'DETECTORS', title: 'TPC' },
                                description: '2nd EOR description',
                            },
                        ],
                        logs: [
                            {
                                id: 120,
                                title: 'Third issue log',
                                tags: [{ text: 'ECS Shifter' }],
                                user: { id: 1 },
                            },
                            {
                                id: 124,
                                title: 'Fifth issue log',
                                tags: [{ text: 'ECS Shifter' }, { text: 'FLP' }],
                            },
                        ],
                    },
                ],
            },
            {
                id: 'ENV2',
                createdAt: new Date('2023-03-17T08:16:03Z'),
                updatedAt: new Date('2023-03-17T08:16:03Z'),
                runs: [],
            },
        ],
        runComments: {
            200: 'A run\ncomment',
        },
        environmentComments: {
            ENV2: 'An environment\ncomment',
        },
    },
    shifter: {
        name: 'John Doe',
    },
    traineeName: 'Trainee',
    shiftStart: MORNING_SHIFT_START,
    shiftFlow: 'The\nshift flow',
    lhcTransitions: 'The\nLHC machine transitions',
    issuesBlock: 'A\nlist\nof issues',
    issuesLogEntries: [
        {
            id: 120,
            title: 'Third issue log',
            tags: [{ text: 'ECS Shifter' }],
            user: { id: 1 },
        },
        {
            id: 124,
            title: 'Fifth issue log',
            tags: [{ text: 'ECS Shifter' }, { text: 'FLP' }],
        },
    ],
    infoFromPreviousShifter: 'Info from\nprevious shifter',
    infoForNextShifter: 'Info for\nnext shifter',
    infoForRmRc: 'Info for\nRM and RC',
};

exports.customizedECSEorReport = customizedECSEorReport;

exports.customizedECSEorReportRequest = {
    typeSpecific: {
        environmentComments: customizedECSEorReport.typeSpecific.environmentComments,
        runComments: customizedECSEorReport.typeSpecific.runComments,
    },
    traineeName: customizedECSEorReport.traineeName,
    shiftStart: customizedECSEorReport.shiftStart,
    shiftFlow: customizedECSEorReport.shiftFlow,
    lhcTransitions: customizedECSEorReport.lhcTransitions,
    issuesBlock: customizedECSEorReport.issuesBlock,
    infoFromPreviousShifter: customizedECSEorReport.infoFromPreviousShifter,
    infoForNextShifter: customizedECSEorReport.infoForNextShifter,
    infoForRmRc: customizedECSEorReport.infoForRmRc,
};

exports.formattedCustomizedEorReport = `\
# End of shift report - ECS - 17/03/2023 Morning
- shifter: John Doe
- trainee: Trainee

## Issues during the shift

### Summary
A
list
of issues

### Issues entries
- \\[ECS Shifter\\] - [Third issue log](http://localhost:4000?page=log-detail&id=120)
- \\[ECS Shifter, FLP\\] - [Fifth issue log](http://localhost:4000?page=log-detail&id=124)

## LHC
The
LHC machine transitions

## Shift flow
The
shift flow

## Environments and runs
- (17/03/2023, 09:13:03) [ENV1](http://localhost:4000?page=env-details&environmentId=ENV1)
    * (17/03/2023, 09:14:03) [200](http://localhost:4000?page=run-detail&id=108) - COMMISSIONING - 01:02:03 - good
        - EOR:
            * DETECTORS - CPV - EOR description
            * DETECTORS - TPC - 2nd EOR description
        - Logs:
            * \\[ECS Shifter\\] [Third issue log](http://localhost:4000?page=log-detail&id=120)
            * \\[ECS Shifter, FLP\\] [Fifth issue log](http://localhost:4000?page=log-detail&id=124)
        - Comment:
          A run
          comment

- (17/03/2023, 09:16:03) [ENV2](http://localhost:4000?page=env-details&environmentId=ENV2)
    * Comments:
      An environment
      comment

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
        environmentComments: {},
        runComments: {},
    },
};

exports.emptyECSEorReport = emptyECSEorReport;

exports.formattedEmptyECSEorReport = `\
# End of shift report - ECS - 17/03/2023 Morning
- shifter: John Doe
- trainee: -

## Issues during the shift

### Summary
-

### Issues entries
-

## LHC
-

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
    typeSpecific: {
        environmentComments: {},
        runComments: {},
    },
    shiftStart: emptyECSEorReport.shiftStart,
};
