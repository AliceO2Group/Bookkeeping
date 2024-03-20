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

import { h } from '@aliceo2/web-ui/Frontend/js/src/index.js';
import { frontLink } from '../../../../components/common/navigation/frontLink.js';
import {
    aliceMagnetsConfigurationForm, aliceMagnetsConfigurationsSnapshotsForm,
} from '../../../../components/common/form/magnetsConfiguration/aliceMagnetsConfigurationsSnapshotsForm.js';
import { contextualInfo } from '../../../../components/common/contextualMessage/contextualMessage.js';
import { formatTimestamp } from '../../../../utilities/formatting/formatTimestamp.js';

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
        h('a', frontLink(`#${run.runNumber}`, 'run-detail', { runNumber: run.runNumber }, { onclick: () => true, target: '_blank' })),
    ))),
];

/**
 * Generates the EoS report form part specific to ECS report
 *
 * @param {object} formData the creation model's form current data
 * @param {object} shiftData the auto-generated shift data
 * @param {{magnets: AliceMagnetsConfigurationSnapshotsFormModel}} shiftData.typeSpecific SL type-specific shift data
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
            h('.f7', contextualInfo(h('.flex-row.items-center.g2', [
                'List the different magnets configuration values (intensity and unit), for example',
                h('.badge', '+ 30kA'),
                ',',
                h('.badge', '- 6kA'),
                'or',
                h('.badge', 'OFF'),
            ]))),
            h('.flex-column.p2.pv3.g3', [
                h('#magnets-start.flex-row.items-center.g2', [
                    formatTimestamp(shift.start),
                    h('', '-'),
                    aliceMagnetsConfigurationForm(formData.typeSpecific.magnets.start),
                ]),
                aliceMagnetsConfigurationsSnapshotsForm(formData.typeSpecific.magnets),
                h('#magnets-end.flex-row.items-center.g2', [
                    formatTimestamp(shift.end),
                    h('', '-'),
                    aliceMagnetsConfigurationForm(formData.typeSpecific.magnets.end),
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
