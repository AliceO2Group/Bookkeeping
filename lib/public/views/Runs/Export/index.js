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
import errorAlert from '../../../components/common/errorAlert.js';
import activeColumns from '../ActiveColumns/index.js';

/**
 * A function to construct the exports runs screen
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the inputs
 */
const exportRunsScreen = (model) => {
    const runNumbers = model.runs.getSelectedRunNumbers();
    const runsFields = Object.keys(activeColumns());
    const selectedRunsFields = model.runs.getSelectedRunsFields;
    const exportTypes = ['JSON', 'CSV'];
    const selectedExportType = model.runs.getSelectedExportType;
    const data = model.runs.getRuns();
    const disabled = data.isLoading();

    return h('div#export-runs', [
        data.isFailure() && data.payload.map(errorAlert),

        h('', {
            onremove: () => model.logs.clearAllEditors(),
        }, [
            h('h2', 'Export Runs'),

            h('label.form-check-label.f4.mt2', { for: 'run-number' }, 'Run numbers'),
            h('label.form-check-label.f6', { for: 'run-number' }, 'Select which runs with one or multiple ' +
                'run numbers, seperated by commas.\''),
            h('input#run-number.form-control.w-100', {
                placeholder: 'Enter the run numbers...',
                value: runNumbers,
                oninput: (e) => model.runs.setSelectedRunNumbers(e.target.value),
                disabled: model.router.params.id ? true : false,
            }),
            h('label.form-check-label.f4.mt2', { for: 'run-number' }, 'Fields'),
            h('label.form-check-label.f6', { for: 'run-number' }, 'Select which fields to be exported\''),
            h('select#fields.form-control', {
                multiple: true,
                onchange: ({ target }) => model.runs.setSelectedRunsFields(target.selectedOptions),
            }, [
                ...runsFields.map((name) => h('option', {
                    value: name,
                    selected: selectedRunsFields.length ? selectedRunsFields.includes(name) : false,
                }, name)),
            ]),
            h('label.form-check-label.f4.mt2', { for: 'run-number' }, 'Export type'),
            h('label.form-check-label.f6', { for: 'run-number' }, 'Select output format\''),
            h('select#fields.form-control', {
                multiple: false,
                onchange: ({ target }) => model.runs.setSelectedExportType(target.value),
            }, [
                ...exportTypes.map((exportType) => h('option', {
                    value: exportType,
                    selected: selectedExportType.length ? selectedExportType.includes(exportType) : false,
                }, exportType)),
            ]),

            h('button.shadow-level1.btn.btn-success.mt2#send', {
                disabled,
                onclick: async () => {
                    const filteredRuns = await model.runs.getFilteredRuns(data.payload);
                    await model.runs.createRunsExport(filteredRuns, 'runs');
                },
            }, data.isLoading() ? 'Exporting...' : 'Export'),
        ]),
    ]);
};

export default (model) => exportRunsScreen(model);
