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
const {
    genericCustomizedEosReport,
    genericEmptyEosReport,
    genericCustomizedEosReportRequest,
    genericFormattedEmptyEosReport,
    genericEmptyEosReportRequest,
    genericFormattedCustomizedEosReport,
} = require('./base-mock-eos-report.js');
const { ShiftTypes } = require('../../lib/domain/enums/ShiftTypes.js');

exports.eosShiftLeaderReportTitle = 'End of shift report - SL - 17/03/2023 Morning';

const customizedShiftLeaderEosReportLogs = [
    {
        id: 120,
        title: 'Third issue log',
        tags: [{ text: 'Shift Leader' }],
    },
    {
        id: 121,
        title: 'Fourth issue log',
        tags: [{ text: 'TEST-TAG-26' }, { text: 'Shift Leader' }, { text: 'EoS' }],
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
        tags: [{ text: 'Shift Leader' }, { text: 'FLP' }],
    },
    {
        id: 125,
        title: 'Sixth issue log',
        tags: [{ text: 'Shift Leader' }, { text: 'FLP' }],
        rootLogId: 124,
        parentLogId: 124,
    },
    {
        id: 126,
        title: 'Seventh issue log',
        tags: [{ text: 'ECS Shifter' }],
    },
    {
        id: 127,
        title: 'Eighth issue log',
        tags: [{ text: 'QC/PDP Shifter' }],
    },
    {
        id: 128,
        title: 'Ninth issue log',
        tags: [{ text: 'DCS Shifter' }],
    },
];

exports.customizedShiftLeaderEosReportLogs = customizedShiftLeaderEosReportLogs;

const customizedShiftLeaderEosReport = {
    ...genericCustomizedEosReport,
    type: ShiftTypes.SL,
    issuesLogEntries: [
        {
            id: 120,
            title: 'Third issue log',
            tags: [{ text: 'Shift Leader' }],
            user: { id: 1 },
        },
        {
            id: 124,
            title: 'Fifth issue log',
            tags: [{ text: 'Shift Leader' }, { text: 'FLP' }],
        },
        {
            id: 126,
            title: 'Seventh issue log',
            tags: [{ text: 'ECS Shifter' }],
        },
        {
            id: 127,
            title: 'Eighth issue log',
            tags: [{ text: 'QC/PDP Shifter' }],
        },
        {
            id: 128,
            title: 'Ninth issue log',
            tags: [{ text: 'DCS Shifter' }],
        },
    ],
    typeSpecific: {
        magnets: {
            start: { solenoid: '30kA +452mT', dipole: '6kA +681mT' },
            intermediates: [
                { timestamp: new Date('2023-01-01 13:30:37'), magnetsConfiguration: { solenoid: '17kA +654mT', dipole: '4kA +131mT' } },
                { timestamp: new Date('2023-01-01 07:13:18'), magnetsConfiguration: { solenoid: '19kA +108mT', dipole: '1kA +901mT' } },
            ],
            end: { solenoid: '25kA -134mT', dipole: '8kA +734mT' },
        },
        runs: {
            COMMISSIONING: [
                {
                    id: 110,
                    timeTrgStart: new Date('2023-03-17T08:14:03Z'),
                    timeTrgEnd: new Date('2023-03-17T09:16:06Z'),
                    runDuration: (3600 + 2 * 60 + 3) * 1000,
                    envId: 'CmCvjNbg',
                    runNumber: 200,
                    runQuality: 'good',
                    eorReasons: [],
                    logs: [
                        {
                            id: 120,
                            title: 'Third issue log',
                            tags: [{ text: 'Shift Leader' }],
                            user: { id: 1 },
                        },
                        {
                            id: 124,
                            title: 'Fifth issue log',
                            tags: [{ text: 'Shift Leader' }, { text: 'FLP' }],
                        },
                    ],
                    detectors: [],
                    detectorsQualities: [],
                },
            ],
            TECHNICAL: [
                {
                    id: 111,
                    runNumber: 201,
                    runQuality: 'good',
                    timeTrgStart: new Date('2023-03-17T08:14:03Z'),
                    timeTrgEnd: new Date('2023-03-17T09:16:06Z'),
                    runDuration: (3600 + 2 * 60 + 3) * 1000,
                    envId: 'TDI59So3d',
                    runTypeId: 14,
                    runType: { name: 'TECHNICAL' },
                    pdpBeamType: 'technical',
                    eorReasons: [],
                    logs: [],
                    detectors: [
                        {
                            id: 4,
                            name: 'ITS',
                            RunDetectors: {
                                detectorId: 4,
                                quality: 'good',
                            },
                        },
                        {
                            id: 15,
                            name: 'TST',
                            RunDetectors: {
                                detectorId: 15,
                                quality: 'bad',
                            },
                        },
                    ],
                }, {
                    id: 112,
                    runNumber: 202,
                    runQuality: 'bad',
                    timeTrgStart: new Date('2023-03-17T08:14:03Z'),
                    timeTrgEnd: new Date('2023-03-17T09:16:06Z'),
                    runDuration: (3600 + 2 * 60 + 3) * 1000,
                    envId: 'EIDO13i3D',
                    runTypeId: 14,
                    runType: { name: 'TECHNICAL' },
                    pdpBeamType: 'technical',
                    eorReasons: [],
                    logs: [],
                    detectors: [
                        {
                            id: 7,
                            name: 'FT0',
                            RunDetectors: {
                                detectorId: 7,
                                quality: 'bad',
                            },
                        },
                        {
                            id: 15,
                            name: 'TST',
                            RunDetectors: {
                                detectorId: 15,
                                quality: 'bad',
                            },
                        },
                    ],
                },
            ],
        },
        tagsCounters: {
            'Shift Leader': 2,
            TEST: 1,
            DCS: 1,
            SL: 1,
            FLP: 1,
            'ECS Shifter': 1,
            'QC/PDP Shifter': 1,
            'DCS Shifter': 1,
        },
    },
};

exports.customizedShiftLeaderEosReport = customizedShiftLeaderEosReport;

exports.customizedShiftLeaderEosReportRequest = {
    ...genericCustomizedEosReportRequest,
    typeSpecific: {
        magnets: customizedShiftLeaderEosReport.typeSpecific.magnets,
        runs: customizedShiftLeaderEosReport.typeSpecific.runs,
        tagsCounters: customizedShiftLeaderEosReport.typeSpecific.tagsCounters,
    },
};

const formattedCustomizedShiftLeaderEosReportTypeSpecific = `
## Magnets
- 07:00:00 - Dipole 6kA +681mT - Solenoid 30kA +452mT
- 08:13:18 - Dipole 1kA +901mT - Solenoid 19kA +108mT
- 14:30:37 - Dipole 4kA +131mT - Solenoid 17kA +654mT
- 15:00:00 - Dipole 8kA +734mT - Solenoid 25kA -134mT

## Statistics of the shift
- Bookkeeping entries per tags
    - Shift Leader (2)
    - TEST (1)
    - DCS (1)
    - SL (1)
    - FLP (1)
    - ECS Shifter (1)
    - QC/PDP Shifter (1)
    - DCS Shifter (1)

## Runs

### COMMISSIONING (1)
- [200](http://localhost:4000?page=run-detail&runNumber=200)

### TECHNICAL (2)
- [201](http://localhost:4000?page=run-detail&runNumber=201)
- [202](http://localhost:4000?page=run-detail&runNumber=202)
`;

const formattedLog = `\
- \\[Shift Leader\\] - [Third issue log](http://localhost:4000?page=log-detail&id=120)
- \\[Shift Leader, FLP\\] - [Fifth issue log](http://localhost:4000?page=log-detail&id=124)
- \\[ECS Shifter\\] - [Seventh issue log](http://localhost:4000?page=log-detail&id=126)
- \\[QC/PDP Shifter\\] - [Eighth issue log](http://localhost:4000?page=log-detail&id=127)
- \\[DCS Shifter\\] - [Ninth issue log](http://localhost:4000?page=log-detail&id=128)\
`;

exports.formattedCustomizedShiftLeaderEosReport = genericFormattedCustomizedEosReport(
    ShiftTypes.SL,
    formattedLog,
    formattedCustomizedShiftLeaderEosReportTypeSpecific,
);

const emptyShiftLeaderEosReport = {
    ...genericEmptyEosReport,
    type: ShiftTypes.SL,
    typeSpecific: {
        runs: {},
        magnets: {
            start: { solenoid: '30kA +452mT', dipole: '6kA +681mT' },
            intermediates: [],
            end: { solenoid: '25kA -134mT', dipole: '8kA +734mT' },
        },
        tagsCounters: {},
    },
};

exports.emptyShiftLeaderEosReport = emptyShiftLeaderEosReport;

const formattedEmptyShiftLeaderEosReportTypeSpecific = `
## Magnets
- 07:00:00 - Dipole 6kA +681mT - Solenoid 30kA +452mT
- 15:00:00 - Dipole 8kA +734mT - Solenoid 25kA -134mT

## Statistics of the shift
- Bookkeeping entries per tags
    - **No entries**

## Runs
-
`;

exports.formattedEmptyShiftLeaderEosReport = genericFormattedEmptyEosReport(ShiftTypes.SL, formattedEmptyShiftLeaderEosReportTypeSpecific);

exports.emptyShiftLeaderEosReportRequest = {
    ...genericEmptyEosReportRequest,
    typeSpecific: {
        runs: {},
        magnets: emptyShiftLeaderEosReport.typeSpecific.magnets,
        tagsCounters: {},
    },
};
