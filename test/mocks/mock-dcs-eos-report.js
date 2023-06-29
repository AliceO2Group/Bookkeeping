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

exports.eosDcsReportTitle = 'End of shift report - DCS - 17/03/2023 Morning';

const customizedDcsEosReportLogs = [
    {
        id: 120,
        title: 'Third issue log',
        tags: [{ text: 'DCS Shifter' }],
    },
    {
        id: 121,
        title: 'Fourth issue log',
        tags: [{ text: 'TEST-TAG-26' }, { text: 'DCS Shifter' }, { text: 'EoS' }],
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
        tags: [{ text: 'DCS Shifter' }, { text: 'FLP' }],
    },
    {
        id: 125,
        title: 'Sixth issue log',
        tags: [{ text: 'DCS Shifter' }, { text: 'FLP' }],
        rootLogId: 124,
        parentLogId: 124,
    },
];

exports.customizedDcsEosReportLogs = customizedDcsEosReportLogs;

const customizedDcsEosReport = {
    ...genericCustomizedEosReport,
    type: ShiftTypes.DCS,
    issuesLogEntries: [
        {
            id: 120,
            title: 'Third issue log',
            tags: [{ text: 'DCS Shifter' }],
        },
        {
            id: 124,
            title: 'Fifth issue log',
            tags: [{ text: 'DCS Shifter' }, { text: 'FLP' }],
        },
    ],
    typeSpecific: {
        alerts: 'An alert\nAnd another one',
    },
};

exports.customizedDcsEosReport = customizedDcsEosReport;

exports.customizedDcsEosReportRequest = {
    ...genericCustomizedEosReportRequest,
    typeSpecific: {
        alerts: customizedDcsEosReport.typeSpecific.alerts,
    },
};

exports.formattedCustomizedDcsEosReport = genericFormattedCustomizedEosReport(
    ShiftTypes.DCS,
    // eslint-disable-next-line max-len
    '- \\[DCS Shifter\\] - [Third issue log](http://localhost:4000?page=log-detail&id=120)\n- \\[DCS Shifter, FLP\\] - [Fifth issue log](http://localhost:4000?page=log-detail&id=124)',
    '\n## Alert handling\nAn alert\nAnd another one\n',
);

const emptyDcsEosReport = {
    ...genericEmptyEosReport,
    type: ShiftTypes.DCS,
    typeSpecific: {
        alerts: '',
    },
};

exports.emptyDcsEosReport = emptyDcsEosReport;

exports.formattedEmptyDcsEosReport = genericFormattedEmptyEosReport(ShiftTypes.DCS, '\n## Alert handling\n-\n');

exports.emptyDcsEosReportRequest = {
    ...genericEmptyEosReportRequest,
    typeSpecific: {
        alerts: '',
    },
};
