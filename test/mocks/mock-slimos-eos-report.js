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

exports.eosSlimosReportTitle = 'End of shift report - SLIMOS - 17/03/2023 Morning';

const customizedSlimosEosReportLogs = [
    {
        id: 120,
        title: 'Third issue log',
        tags: [{ text: 'SLIMOS' }],
    },
    {
        id: 121,
        title: 'Fourth issue log',
        tags: [{ text: 'TEST-TAG-26' }, { text: 'SLIMOS' }, { text: 'EoS' }],
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
        tags: [{ text: 'SLIMOS' }, { text: 'FLP' }],
    },
    {
        id: 125,
        title: 'Sixth issue log',
        tags: [{ text: 'SLIMOS' }, { text: 'FLP' }],
        rootLogId: 124,
        parentLogId: 124,
    },
];

exports.customizedSlimosEosReportLogs = customizedSlimosEosReportLogs;

const customizedSlimosEosReport = {
    ...genericCustomizedEosReport,
    type: ShiftTypes.SLIMOS,
    issuesLogEntries: [
        {
            id: 120,
            title: 'Third issue log',
            tags: [{ text: 'SLIMOS' }],
        },
        {
            id: 124,
            title: 'Fifth issue log',
            tags: [{ text: 'SLIMOS' }, { text: 'FLP' }],
        },
    ],
    typeSpecific: null,
};

exports.customizedSlimosEosReport = customizedSlimosEosReport;

exports.customizedSlimosEosReportRequest = {
    ...genericCustomizedEosReportRequest,
    typeSpecific: null,
};

exports.formattedCustomizedSlimosEosReport = genericFormattedCustomizedEosReport(
    ShiftTypes.SLIMOS,
    // eslint-disable-next-line max-len
    '- \\[SLIMOS\\] - [Third issue log](http://localhost:4000?page=log-detail&id=120)\n- \\[SLIMOS, FLP\\] - [Fifth issue log](http://localhost:4000?page=log-detail&id=124)',
    '',
);

const emptySlimosEosReport = {
    ...genericEmptyEosReport,
    type: ShiftTypes.SLIMOS,
    typeSpecific: null,
};

exports.emptySlimosEosReport = emptySlimosEosReport;

exports.formattedEmptySlimosEosReport = genericFormattedEmptyEosReport(ShiftTypes.SLIMOS, '');

exports.emptySlimosEosReportRequest = {
    ...genericEmptyEosReportRequest,
    typeSpecific: null,
};
