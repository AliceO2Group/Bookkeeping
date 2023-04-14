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
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';

/**
 * Generates the EoS report form part specific to ECS report
 *
 * @param {object} formData the creation model's form current data
 * @param {object} shiftData the auto-generated shift data
 * @return {Component} the ecs form specific part
 */
const eosFormEcsSpecificPart = (formData, { typeSpecific: { environments } }) => h('#type-specific.panel', [
    h('.panel-header', 'Environments & runs'),
    environments.map((environment) => h(
        '.p2',
        h('.flex-row.g2', [
            `- [${formatTimestamp(environment.createdAt)}]`,
            h('a', frontLink(environment.id, 'env-details', { environmentId: environment.id })),
        ]),
        environment.runs.length > 0
            ? h('ul', environment.runs.map((run) => h(
                '',
                h('.li.flex-row.g2', [
                    `* [${formatTimestamp(environment.createdAt)}]`,
                    h('a', frontLink(`#${run.runNumber}`, 'run-detail', { id: run.id })),
                    h('', '-'),
                    h('', run.definition),
                    h('', '-'),
                    h('', run.runQuality),
                ]),
                (run.eorReasons || run.logs) && h('ul', [
                    run.eorReasons.length > 0
                        ? h('li', [
                            'EOR:',
                            h('ul', run.eorReasons.map(({ category, title, description }) => {
                                let ret = category;
                                if (title) {
                                    ret += ` - ${title}`;
                                }
                                ret += ` - ${description}`;
                                return h('li', ret);
                            })),
                        ])
                        : null,
                    run.logs.length > 0
                        ? h('li', [
                            'Logs:',
                            h('ul', run.logs.map((log) => h('.li.flex-row.g2', [
                                h('', `[${log.tags.length > 0 ? log.tags.map(({ text }) => text).join(', ') : '**No tags**'}]`),
                                frontLink(log.title, 'log-detail', { id: log.id }),
                            ]))),
                        ])
                        : null,
                ]),
            )))
            : null,
    )),
]);

/**
 * Generate the form to create EOS report
 *
 * @param {object} formData the creation model's form current data
 * @param {object} shiftData the auto-generated shift data
 * @return {Component} the form component
 */
const eosReportCreationForm = (formData, shiftData) => [
    h('.flex-column.g3', [
        h('#trainee-name.panel', [
            h('label.panel-header', 'Trainee name'),
            h('input.form-control', {
                value: formData.traineeName,
                // eslint-disable-next-line no-return-assign
                onchange: (e) => formData.traineeName = e.target.value,
            }),
        ]),
        h('#issues-block.panel', [
            h('.panel-header', 'Issues during the shift'),
            h('', [
                h(
                    '.m0.p2.flex-column',
                    shiftData.issuesLogs.length > 0
                        ? shiftData.issuesLogs.map((log) => {
                            const formattedTags = log.tags.length > 0 ? log.tags.map(({ text }) => text).join(', ') : '**no tags**';
                            return h('', [
                                `- [${formattedTags}] - `,
                                frontLink(log.title, 'log-detail', { id: log.id }),
                            ]);
                        })
                        : '-',
                ),
                h('hr.mh2'),
                h('label.m0.pv2.ph2.border-bottom', 'Summary of issues encountered during the shift:'),
            ]),
            h('', [
                markdownInput(
                    formData.issuesBlock,
                    {
                        // eslint-disable-next-line no-return-assign
                        onchange: (e) => formData.issuesBlock = e.target.value,
                    },
                    null,
                    { height: '10rem' },
                ),
            ]),
        ]),
        h('#shift-flow.panel', [
            h('label.panel-header', 'Shift flow'),
            markdownInput(
                formData.shiftFlow,
                {
                    // eslint-disable-next-line no-return-assign
                    onchange: (e) => formData.shiftFlow = e.target.value,
                },
                null,
                { height: '20rem' },
            ),
        ]),
        // For now, handle only ECS shift
        eosFormEcsSpecificPart(formData, shiftData),
        h('#from-previous-shifter.panel', [
            h('label.panel-header', 'Info from previous shifter'),
            markdownInput(
                formData.infoFromPreviousShifter,
                {
                    // eslint-disable-next-line no-return-assign
                    onchange: (e) => formData.infoFromPreviousShifter = e.target.value,
                },
                null,
                { height: '10rem' },
            ),
        ]),
        h('#for-next-shifter.panel', [
            h('label.panel-header', 'Info for next shifter'),
            markdownInput(
                formData.infoForNextShifter,
                {
                    // eslint-disable-next-line no-return-assign
                    onchange: (e) => formData.infoForNextShifter = e.target.value,
                },
                null,
                { height: '10rem' },
            ),
        ]),
        h('#for-rm-rc.panel', [
            h('label.panel-header', 'Info for RM/RC'),
            markdownInput(
                formData.infoForRmRc,
                {
                    // eslint-disable-next-line no-return-assign
                    onchange: (e) => formData.infoForRmRc = e.target.value,
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
    eosReportCreationModel.currentShiftData.match({
        Loading: () => spinner(),
        Success: (shiftData) => creationFormComponent(eosReportCreationModel, eosReportCreationForm(eosReportCreationModel.data, shiftData)),
        Failure: () => h('.mh2.mt2.alert.alert-danger', 'Unable to fetch the shift log entries'),
        NotAsked: () => null,
    }),
];
