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

import { h, iconTrash } from '/js/src/index.js';
import { frontLink } from '../../../../components/common/navigation/frontLink.js';
import { getLocaleDateAndTime } from '../../../../utilities/dateUtils.js';

/**
 * Runs are grouped by definition, and all the runs for a given definition are displayed together in what is named a panel
 *
 * @param {string} definition the panel's run definition
 * @param {Run[]} runs the panel's runs
 * @return {Component} the resulting component
 */
const formatDefinitionPanel = (definition, runs) => [
    h('h3', `${definition} (${runs.length})`),
    h('ul.mv1', runs.map((run) => h(
        'li.mv1',
        h('a', frontLink(`#${run.runNumber}`, 'run-detail', { id: run.id }, { onclick: () => true, target: '_blank' })),
    ))),
];

/**
 * Return a component to fill magnet information at a given time
 *
 * @param {MagnetConfigurationSnapshot} magnetConfigurationSnapshot the form model
 * @return {Component} the magnet information snapshot input
 */
const magnetConfigurationSnapshotInputComponent = (magnetConfigurationSnapshot) => h('.flex-row.items-center.g2', [
    h(
        'input.form-control.w-unset',
        {
            type: 'time',
            step: 1,
            value: magnetConfigurationSnapshot.timestamp,
            // eslint-disable-next-line no-return-assign
            oninput: (e) => magnetConfigurationSnapshot.timestamp = e.target.value,
        },
    ),
    h('', '-'),
    magnetConfigurationInputComponent(magnetConfigurationSnapshot.magnetConfiguration),
]);

/**
 * Return a component to fill magnet information
 *
 * @param {MagnetConfiguration} magnetConfiguration the magnet configuration model
 * @return {Component} the magnet configuration form
 */
const magnetConfigurationInputComponent = (magnetConfiguration) => [
    h('', 'Solenoid'),
    h(
        'input.form-control.w-unset',
        {
            value: magnetConfiguration.solenoid,
            // eslint-disable-next-line no-return-assign
            oninput: (e) => magnetConfiguration.solenoid = e.target.value,
        },
    ),
    h('', '-'),
    h('', 'Dipole'),
    h(
        'input.form-control.w-unset',
        {
            value: magnetConfiguration.dipole,
            // eslint-disable-next-line no-return-assign
            oninput: (e) => magnetConfiguration.dipole = e.target.value,
        },
    ),
];

/**
 * Return the intermediates magnet configuration form
 *
 * @param {MagnetConfigurationSnapshot} intermediatesMagnetConfiguration the intermediates configuration
 * @return {Component}  the form
 */
const intermediatesMagnetConfigurationForm = (intermediatesMagnetConfiguration) => {
    const entries = Object.entries(intermediatesMagnetConfiguration)
        .filter(([_, value]) => value !== null);

    entries.sort(([_keyA, { timestamp: a }], [_keyB, { timestamp: b }]) => (a || '99:99:99').localeCompare(b || '99:99:99'));

    return entries.map(([key, magnetConfigurationSnapshot]) => h(
        `#magnets-${key}.flex-row.items-center.g2`,
        {
            key,
        },
        [
            magnetConfigurationSnapshotInputComponent(magnetConfigurationSnapshot),
            // eslint-disable-next-line no-return-assign
            h('.btn.btn-danger', { onclick: () => intermediatesMagnetConfiguration[key] = null }, iconTrash()),
        ],
    ));
};

/**
 * Generates the EoS report form part specific to ECS report
 *
 * @param {object} formData the creation model's form current data
 * @param {object} shiftData the auto-generated shift data
 * @return {Component} the shift leader form specific part
 */
export const eosFormShiftLeaderSpecificPart = (formData, { typeSpecific, shift, issuesLogs }) => {
    const runsByDefinition = Object.entries(typeSpecific.runs);
    const logsByTagsCounter = {};
    for (const log of issuesLogs) {
        for (const { text: tag } of log.tags) {
            logsByTagsCounter[tag] = (logsByTagsCounter[tag] || 0) + 1;
        }
    }
    return h('#type-specific.flex-column.g3', [
        h('.panel', [
            h('.panel-header', 'Magnets'),
            h('.flex-column.p2.pv3.g3', [
                h('#magnets-start.flex-row.items-center.g2', [
                    getLocaleDateAndTime(shift.start, { timezone: 'Europe/Zurich' }).time,
                    h('', '-'),
                    magnetConfigurationInputComponent(formData.typeSpecific.magnets.start),
                ]),
                intermediatesMagnetConfigurationForm(formData.typeSpecific.magnets.intermediates),
                h('.flex-row.items-center.g2', [
                    h(
                        '#magnets-add.button.btn.btn-primary',
                        {
                            onclick: () => formData.typeSpecific.magnets.intermediates.push({
                                timestamp: null,
                                magnetConfiguration: { solenoid: null, dipole: null },
                            }),
                        },
                        'Add',
                    ),
                ]),
                h('#magnets-end.flex-row.items-center.g2', [
                    getLocaleDateAndTime(shift.end, { timezone: 'Europe/Zurich' }).time,
                    h('', '-'),
                    magnetConfigurationInputComponent(formData.typeSpecific.magnets.end),
                ]),
            ]),
        ]),
        h('.panel', [
            h('.panel-header', 'Shift statistics'),
            h('.flex-column.p2.pv3.g3', [
                h('.flex-row.items-center.g2', [
                    h('', 'Entries per tag: '),
                    (() => {
                        const tagsCounters = Object.entries(typeSpecific.tagsCounters);
                        return tagsCounters.length > 0
                            ? tagsCounters.map(([tag, count]) => `${tag} (${count})`).join(', ')
                            : h('em', 'No entries');
                    })(),
                ]),
            ]),
        ]),
        h('.panel', [
            h('.panel-header', 'Runs'),
            runsByDefinition.length > 0
                ? runsByDefinition.map(([definition, runs]) => h(
                    '.p2.pv3.flex-grow',
                    formatDefinitionPanel(definition, runs),
                ))
                : h('.p2.pv2', '-'),
        ]),
    ]);
};
