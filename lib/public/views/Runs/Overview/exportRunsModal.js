/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';
import activeColumns from '../ActiveColumns/index.js';
import pick from '../../../utilities/pick.js';

/**
 * Export form component, containing the fields to export, the export type and the export button
 *
 * @param {Model} model the global model
 * @param {array} runs the runs to export
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 *
 * @return {vnode[]} the form component
 */
const exportForm = (model, runs, modalHandler) => {
    const exportTypes = ['JSON', 'CSV'];
    const selectedRunsFields = model.runs.getSelectedRunsFields() || [];
    const selectedExportType = model.runs.getSelectedExportType() || exportTypes[0];
    const currentActiveColumns = activeColumns(model);
    const runsFields = Object.keys(currentActiveColumns);
    const enabled = runs && selectedRunsFields.length > 0 && Boolean(selectedExportType);

    return [
        model.runs.isAllRunsTruncated
            ? h(
                '#truncated-export-warning.warning',
                `The runs export is limited to ${runs.length} entries, only the last runs will be exported (sorted by run number)`,
            )
            : null,
        h('label.form-check-label.f4.mt1', { for: 'run-number' }, 'Fields'),
        h(
            'label.form-check-label.f6',
            { for: 'run-number' },
            'Select which fields to be exported. (CTRL + click for multiple selection)',
        ),
        h('select#fields.form-control', {
            style: 'min-height: 20rem;',
            multiple: true,
            onchange: ({ target }) => model.runs.setSelectedRunsFields(target.selectedOptions),
        }, [
            ...runsFields
                .filter((name) => !['id', 'actions'].includes(name))
                .map((name) => h('option', {
                    value: name,
                    selected: selectedRunsFields.length ? selectedRunsFields.includes(name) : false,
                }, name)),
        ]),
        h('label.form-check-label.f4.mt1', { for: 'run-number' }, 'Export type'),
        h('label.form-check-label.f6', { for: 'run-number' }, 'Select output format'),
        h('.flex-row.g3', exportTypes.map((exportType) => {
            const id = `runs-export-type-${exportType}`;
            return h('.form-check', [
                h('input.form-check-input', {
                    id,
                    type: 'radio',
                    value: exportType,
                    checked: selectedExportType.length ? selectedExportType.includes(exportType) : false,
                    name: 'runs-export-type',
                    onclick: () => model.runs.setSelectedExportType(exportType),
                }),
                h('label.form-check-label', {
                    for: id,
                }, exportType),
            ]);
        })),
        h('button.shadow-level1.btn.btn-success.mt2#send', {
            disabled: !enabled,
            onclick: async () => {
                await model.runs.createRunsExport(
                    runs.map((selectedRun) => {
                        const entries = Object.entries(pick(selectedRun, selectedRunsFields));
                        const formattedEntries = entries.map(([key, value]) => {
                            const formatExport = currentActiveColumns[key].exportFormat || ((identity) => identity);
                            return [key, formatExport(value, selectedRun)];
                        });
                        return Object.fromEntries(formattedEntries);
                    }),
                    'runs',
                );
                modalHandler.dismiss();
            },
        }, runs ? 'Export' : 'Loading data'),
    ];
};

// eslint-disable-next-line require-jsdoc
const errorDisplay = () => h('.danger', 'Data fetching failed');

/**
 * A function to construct the exports runs screen
 * @param {Model} model Pass the model to access the defined functions
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 * @return {vnode} Return the view of the inputs
 */
export const exportRunsModal = (model, modalHandler) => {
    const runsRemoteData = model.runs.allRuns;

    return h('div#export-runs-modal', [
        h('h2', 'Export Runs'),
        runsRemoteData.match({
            NotAsked: () => errorDisplay(),
            Loading: () => exportForm(model, null, modalHandler),
            Success: (payload) => exportForm(model, payload, modalHandler),
            Failure: () => errorDisplay(),
        }),
    ]);
};
