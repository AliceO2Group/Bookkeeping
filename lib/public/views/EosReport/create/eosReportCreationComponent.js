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

import { h } from '/js/src/index.js';
import { markdownInput } from '../../../components/common/markdown/markdown.js';
import spinner from '../../../components/common/spinner.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { creationFormComponent } from '../../../components/common/form/creationFormComponent.js';

/**
 * Generate the form to create EOS report
 *
 * @param {EosReportCreationModel} eosReportCreationModel the creation model
 * @return {Component} the form component
 */
const eosReportCreationForm = (eosReportCreationModel) => [
    h('.flex-column.g3', [
        h('#trainee-name.panel', [
            h('label.panel-header', 'Trainee name'),
            h('input.form-control', {
                value: eosReportCreationModel.data.traineeName,
                // eslint-disable-next-line no-return-assign
                onchange: (e) => eosReportCreationModel.data.traineeName = e.target.value,
            }),
        ]),
        h('#issues-block.panel', [
            h('.panel-header', 'Issues during the shift'),
            h('', [
                eosReportCreationModel.currentShiftData.match({
                    Loading: () => spinner({ absolute: false, size: 2 }),
                    Success: ({ issuesLogs }) => h(
                        '.m0.p2.flex-column',
                        issuesLogs.length > 0
                            ? issuesLogs.map((log) => {
                                const formattedTags = log.tags.length > 0 ? log.tags.map(({ text }) => text).join(', ') : '**no tags**';
                                return h('', [
                                    `- [${formattedTags}] - `,
                                    frontLink(log.title, 'log-detail', { id: log.id }),
                                ]);
                            })
                            : '-',
                    ),
                    Failure: () => h('.mh2.mt2.alert.alert-danger', 'Unable to fetch the shift log entries'),
                    NotAsked: () => null,
                }),
                !eosReportCreationModel.currentShiftData.isNotAsked() && h('hr.mh2'),
                h('label.m0.pv2.ph2.border-bottom', 'Summary of issues encountered during the shift:'),
            ]),
            h('', [
                markdownInput(
                    eosReportCreationModel.data.issuesBlock,
                    {
                        // eslint-disable-next-line no-return-assign
                        onchange: (e) => eosReportCreationModel.data.issuesBlock = e.target.value,
                    },
                    null,
                    { height: '10rem' },
                ),
            ]),
        ]),
        h('#shift-flow.panel', [
            h('label.panel-header', 'Shift flow'),
            markdownInput(
                eosReportCreationModel.data.shiftFlow,
                {
                    // eslint-disable-next-line no-return-assign
                    onchange: (e) => eosReportCreationModel.data.shiftFlow = e.target.value,
                },
                null,
                { height: '20rem' },
            ),
        ]),
        h('#from-previous-shifter.panel', [
            h('label.panel-header', 'Info from previous shifter'),
            markdownInput(
                eosReportCreationModel.data.infoFromPreviousShifter,
                {
                    // eslint-disable-next-line no-return-assign
                    onchange: (e) => eosReportCreationModel.data.infoFromPreviousShifter = e.target.value,
                },
                null,
                { height: '10rem' },
            ),
        ]),
        h('#for-next-shifter.panel', [
            h('label.panel-header', 'Info for next shifter'),
            markdownInput(
                eosReportCreationModel.data.infoForNextShifter,
                {
                    // eslint-disable-next-line no-return-assign
                    onchange: (e) => eosReportCreationModel.data.infoForNextShifter = e.target.value,
                },
                null,
                { height: '10rem' },
            ),
        ]),
        h('#for-rm-rc.panel', [
            h('label.panel-header', 'Info for RM/RC'),
            markdownInput(
                eosReportCreationModel.data.infoForRmRc,
                {
                    // eslint-disable-next-line no-return-assign
                    onchange: (e) => eosReportCreationModel.data.infoForRmRc = e.target.value,
                },
                null,
                { height: '10rem' },
            ),
        ]),
    ]),
];

/**
 * Returns the EOS report creation component
 *
 * @param {EosReportCreationModel} eosReportCreationModel the EOS report creation model
 * @return {Component} the EOS report creation component
 */
export const eosReportCreationComponent = (eosReportCreationModel) => [
    h('h1', 'Create end of shift report'),
    creationFormComponent(eosReportCreationModel, eosReportCreationForm(eosReportCreationModel)),
];
