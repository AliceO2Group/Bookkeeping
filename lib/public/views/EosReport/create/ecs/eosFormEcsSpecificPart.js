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
import { formatTimestamp } from '../../../../utilities/formatting/formatTimestamp.js';
import { frontLink } from '../../../../components/common/navigation/frontLink.js';

/**
 * Returns a labelled comment input component
 *
 * @param {string|undefined} value the current input value
 * @param {function} onChange function called with the new value if input value change
 * @return {Component} the input component
 */
const commentInput = (value, onChange) => h('li', [
    h('label.m0', 'Comments'),
    h(
        'textarea.form-control',
        {
            rows: 1,
            style: 'resize: vertical',
            onchange: (e) => onChange(e.target.value),
        },
        value || '',
    ),
]);

/**
 * Format the given environment to be displayed in an ECS EOS report
 *
 * @param {Environment} environment the environment to format
 * @param {object} environmentComments the object containing environments comments
 * @param {object} runComments the object containing runs comments
 * @return {Component} the resulting component
 */
const formatEnvironment = (environment, environmentComments, runComments) => [
    h('.flex-row.g2.mv1', [
        `[${formatTimestamp(environment.createdAt)}]`,
        h('a', frontLink(environment.id, 'env-details', { environmentId: environment.id }, { onclick: () => true, target: '_blank' })),
    ]),
    h('ul.mv1', environment.runs.length > 0
        ? environment.runs.map((run) => h(
            'li.mv1',
            h('.flex-row.g2', [
                `[${formatTimestamp(environment.createdAt)}]`,
                h('a', frontLink(`#${run.runNumber}`, 'run-detail', { id: run.id }, { onclick: () => true, target: '_blank' })),
                h('', '-'),
                h('', run.definition),
                h('', '-'),
                h('', run.runQuality),
            ]),
            h('ul', [
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
                commentInput(runComments[run.runNumber], (value) => {
                    runComments[run.runNumber] = value;
                }),
            ]),
        ))
        : commentInput(environmentComments[environment.id], (value) => {
            environmentComments[environment.id] = value;
        })),
];

/**
 * Generates the EoS report form part specific to ECS report
 *
 * @param {object} formData the creation model's form current data
 * @param {object} shiftData the auto-generated shift data
 * @return {Component} the ecs form specific part
 */
export const eosFormEcsSpecificPart = (formData, { typeSpecific: { environments } }) => h('#type-specific.panel', [
    h('.panel-header', 'Environments & runs'),
    environments.length > 0
        ? environments.map((environment) => h(
            '.p2.pv3.flex-grow',
            formatEnvironment(environment, formData.typeSpecific.environmentComments, formData.typeSpecific.runComments),
        ))
        : h('.p2.pv2', '-'),
]);
