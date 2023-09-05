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
const { RunDefinition } = require('../../lib/server/services/run/getRunDefinition.js');

exports.eosQcPdpReportTitle = 'End of shift report - QC/PDP - 17/03/2023 Morning';

const customizedQcPdpEosReportLogs = [
    {
        id: 120,
        title: 'Third issue log',
        tags: [{ text: 'QC/PDP Shifter' }],
    },
    {
        id: 121,
        title: 'Fourth issue log',
        tags: [{ text: 'TEST-TAG-26' }, { text: 'QC/PDP Shifter' }, { text: 'EoS' }],
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
        tags: [{ text: 'QC/PDP Shifter' }, { text: 'FLP' }],
    },
    {
        id: 125,
        title: 'Sixth issue log',
        tags: [{ text: 'QC/PDP Shifter' }, { text: 'FLP' }],
        rootLogId: 124,
        parentLogId: 124,
    },
];

exports.customizedQcPdpEosReportLogs = customizedQcPdpEosReportLogs;

const customizedQcPdpEosReport = {
    ...genericCustomizedEosReport,
    type: ShiftTypes.QC_PDP,
    issuesLogEntries: [
        {
            id: 120,
            title: 'Third issue log',
            tags: [{ text: 'QC/PDP Shifter' }],
            user: { id: 1 },
        },
        {
            id: 124,
            title: 'Fifth issue log',
            tags: [{ text: 'QC/PDP Shifter' }, { text: 'FLP' }],
        },
    ],
    typeSpecific: {
        runs: {
            COMMISSIONING: [
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
                            tags: [{ text: 'QC/PDP Shifter' }],
                            user: { id: 1 },
                        },
                        {
                            id: 124,
                            title: 'Fifth issue log',
                            tags: [{ text: 'QC/PDP Shifter' }, { text: 'FLP' }],
                        },
                    ],
                    detectors: [],
                    detectorsQualities: [],
                    definition: RunDefinition.Commissioning,
                },
            ],
            TECHNICAL: [
                {
                    id: 109,
                    runNumber: 201,
                    runQuality: 'good',
                    timeTrgStart: new Date('2023-03-17T08:14:03Z'),
                    timeTrgEnd: new Date('2023-03-17T09:16:06Z'),
                    runDuration: (3600 + 2 * 60 + 3) * 1000,
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
                    id: 110,
                    runNumber: 202,
                    runQuality: 'bad',
                    timeTrgStart: new Date('2023-03-17T08:14:03Z'),
                    timeTrgEnd: new Date('2023-03-17T09:16:06Z'),
                    runDuration: (3600 + 2 * 60 + 3) * 1000,
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
        runComments: {
            200: 'A run\ncomment',
        },
    },
};

exports.customizedQcPdpEosReport = customizedQcPdpEosReport;

exports.customizedQcPdpEosReportRequest = {
    ...genericCustomizedEosReportRequest,
    typeSpecific: {
        runs: customizedQcPdpEosReport.typeSpecific.runs,
        runComments: customizedQcPdpEosReport.typeSpecific.runComments,
    },
};

const formattedCustomizedQcPdpEosReportTypeSpecific = `
## Runs

### COMMISSIONING
- [200](http://localhost:4000?page=run-detail&id=108) - 01:02:03 - good
    * Detectors: -
    * Detectors QC bad: -
    * EOR:
        * DETECTORS - CPV - EOR description
        * DETECTORS - TPC - 2nd EOR description
    * Logs:
        * \\[QC/PDP Shifter\\] - [Third issue log](http://localhost:4000?page=log-detail&id=120)
        * \\[QC/PDP Shifter, FLP\\] - [Fifth issue log](http://localhost:4000?page=log-detail&id=124)
    * Comment:
      A run
      comment

### TECHNICAL
- [201](http://localhost:4000?page=run-detail&id=109) - 01:02:03 - good
    * Detectors: \`ITS\`, \`TST\`
    * Detectors QC bad: \`TST\`
- [202](http://localhost:4000?page=run-detail&id=110) - 01:02:03 - bad
    * Detectors: \`FT0\`, \`TST\`
    * Detectors QC bad: \`FT0\`, \`TST\`
`;

exports.formattedCustomizedQcPdpEosReport = genericFormattedCustomizedEosReport(
    ShiftTypes.QC_PDP,
    // eslint-disable-next-line max-len
    '- \\[QC/PDP Shifter\\] - [Third issue log](http://localhost:4000?page=log-detail&id=120)\n- \\[QC/PDP Shifter, FLP\\] - [Fifth issue log](http://localhost:4000?page=log-detail&id=124)',
    formattedCustomizedQcPdpEosReportTypeSpecific,
);

const emptyQcPdpEosReport = {
    ...genericEmptyEosReport,
    type: ShiftTypes.QC_PDP,
    typeSpecific: {
        runs: {},
        runComments: {},
    },
};

exports.emptyQcPdpEosReport = emptyQcPdpEosReport;

exports.formattedEmptyQcPdpEosReport = genericFormattedEmptyEosReport(ShiftTypes.QC_PDP, '\n## Runs\n-\n');

exports.emptyQcPdpEosReportRequest = {
    ...genericEmptyEosReportRequest,
    typeSpecific: {
        runs: {},
        runComments: {},
    },
};
