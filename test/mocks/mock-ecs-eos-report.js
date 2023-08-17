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
    genericCustomTimeEosReport,
    genericCustomTimeEosReportRequest,
    genericFormattedCustomTimeEosReport,
} = require('./base-mock-eos-report.js');
const { genericFormattedCustomizedEosReport } = require('./base-mock-eos-report.js');
const { ShiftTypes } = require('../../lib/domain/enums/ShiftTypes.js');
const { RunDefinition } = require('../../lib/server/services/run/getRunDefinition.js');

exports.eosEcsReportTitle = 'End of shift report - ECS - 17/03/2023 Morning';

const customizedECSEosReportLogs = [
    {
        id: 120,
        title: 'Third issue log',
        tags: [{ text: 'ECS Shifter' }],
    },
    {
        id: 121,
        title: 'Fourth issue log',
        tags: [{ text: 'TEST-TAG-26' }, { text: 'ECS Shifter' }, { text: 'EoS' }],
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
    {
        id: 125,
        title: 'Sixth issue log',
        tags: [{ text: 'ECS Shifter' }, { text: 'FLP' }],
        rootLogId: 124,
        parentLogId: 124,
    },
];

exports.customizedECSEosReportLogs = customizedECSEosReportLogs;

const customizedECSEosReport = {
    ...genericCustomizedEosReport,
    type: ShiftTypes.ECS,
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
                        definition: RunDefinition.Commissioning,
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
};

exports.customizedECSEosReport = customizedECSEosReport;

exports.customizedECSEosReportRequest = {
    ...genericCustomizedEosReportRequest,
    typeSpecific: {
        environmentComments: customizedECSEosReport.typeSpecific.environmentComments,
        runComments: customizedECSEosReport.typeSpecific.runComments,
    },
};

const formattedCustomizedECSEosReportTypeSpecific = `
## Environments and runs
- (17/03/2023, 09:13:03) [ENV1](http://localhost:4000?page=env-details&environmentId=ENV1)
    * (17/03/2023, 09:14:03) [200](http://localhost:4000?page=run-detail&id=108) - COMMISSIONING - 01:02:03 - good
        - EOR:
            * DETECTORS - CPV - EOR description
            * DETECTORS - TPC - 2nd EOR description
        - Logs:
            * \\[ECS Shifter\\] - [Third issue log](http://localhost:4000?page=log-detail&id=120)
            * \\[ECS Shifter, FLP\\] - [Fifth issue log](http://localhost:4000?page=log-detail&id=124)
        - Comment:
          A run
          comment

- (17/03/2023, 09:16:03) [ENV2](http://localhost:4000?page=env-details&environmentId=ENV2)
    * Comments:
      An environment
      comment
`;

exports.formattedCustomizedECSEosReport = genericFormattedCustomizedEosReport(
    ShiftTypes.ECS,
    // eslint-disable-next-line max-len
    '- \\[ECS Shifter\\] - [Third issue log](http://localhost:4000?page=log-detail&id=120)\n- \\[ECS Shifter, FLP\\] - [Fifth issue log](http://localhost:4000?page=log-detail&id=124)',
    formattedCustomizedECSEosReportTypeSpecific,
);

const emptyECSEosReport = {
    ...genericEmptyEosReport,
    type: ShiftTypes.ECS,
    typeSpecific: {
        environments: [],
        environmentComments: {},
        runComments: {},
    },
};

exports.emptyECSEosReport = emptyECSEosReport;

exports.formattedEmptyECSEosReport = genericFormattedEmptyEosReport(ShiftTypes.ECS, '\n## Environments and runs\n-\n');

exports.emptyECSEosReportRequest = {
    ...genericEmptyEosReportRequest,
    typeSpecific: {
        environmentComments: {},
        runComments: {},
    },
};
