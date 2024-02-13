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
import { runsActiveColumns } from '../ActiveColumns/runsActiveColumns.js';
import spinner from '../../../components/common/spinner.js';
import { EXPORT_TYPES } from './ExportManager.js';

/**
 * Export form component, containing the fields to export, the export type and the export button
 *
 * @param {RunsOverviewModel} runsOverviewModel the runsOverviewModel
 * @param {Run[]} runs the runs to export
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 *
 * @return {Component} the form component
 */
const exportForm = (exportModel, runs, modalHandler) => {
    const { selectedFields = [] } = exportModel;

    const runsFields = Object.keys(runsActiveColumns);
    const loadingData = !runs;
    const exportEnabled = selectedFields.length > 0 && !loadingData;

    return [
        loadingData
            ? spinner({ size: 2, absolute: false })
            : exportModel.areExportItemsTruncated
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
            onchange: ({ target }) => {
                exportModel.selectedFields = [...target.selectedOptions].map(({ value }) => value);
            },
        }, [
            ...runsFields
                .filter((name) => !['id', 'actions'].includes(name))
                .map((name) => h('option', {
                    value: name,
                    selected: selectedFields.length ? selectedFields.includes(name) : false,
                }, name)),
        ]),
        h('label.form-check-label.f4.mt1', { for: 'run-number' }, 'Export type'),
        h('label.form-check-label.f6', { for: 'run-number' }, 'Select output format'),
        h('.flex-row.g3', EXPORT_TYPES.map((exportType) => {
            const id = `runs-export-type-${exportType}`;
            return h('.form-check', [
                h('input.form-check-input', {
                    id,
                    type: 'radio',
                    value: exportType,
                    checked: exportModel.exportType === exportType,
                    name: 'runs-export-type',
                    onclick: () => {
                        exportModel.exportType = exportType;
                    },
                }),
                h('label.form-check-label', {
                    for: id,
                }, exportType),
            ]);
        })),
        h('button.shadow-level1.btn.btn-success.mt2#send', {
            disabled: !exportEnabled,
            onclick: async () => {
                await exportModel.createExport(runs, 'runs', runsActiveColumns);
                modalHandler.dismiss();
            },
        }, !loadingData ? 'Export' : 'Loading data'),
    ];
};

// eslint-disable-next-line require-jsdoc
const errorDisplay = () => h('.danger', 'Data fetching failed');

/**
 * A function to construct the exports runs screen
 * @param {RunsOverviewModel} runsOverviewModel Pass the model to access the defined functions
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 * @return {Component} Return the view of the inputs
 */
const exportRunsModal = (runsOverviewModel, modalHandler) => {
    runsOverviewModel.loadExportRuns();
    const runsRemoteData = runsOverviewModel.exportItems;
    const { exportModel } = runsOverviewModel;

    return h('div#export-runs-modal', [
        h('h2', 'Export Runs'),
        runsRemoteData.match({
            Loading: () => exportForm(exportModel, null, modalHandler),
            Success: (payload) => exportForm(exportModel, payload, modalHandler),
            Failure: () => errorDisplay(),
            NotAsked: () => errorDisplay(),
        }),
    ]);
};

/**
 * Builds a button which will open popover for data export
 * @param {RunsOverviewModel} runsModel runs overview model
 * @param {ModelModel} modalModel modal model
 * @returns {Component} button
 */
export const exportRunsTriggerAndModal = (runsModel, modalModel) => h('button.btn.btn-primary.w-15.h2.mlauto#export-runs-trigger', {
    disabled: runsModel.items.match({
        Success: (payload) => payload.length === 0,
        Other: () => true,
    }),
    onclick: () => modalModel.display({ content: (modalModel) => exportRunsModal(runsModel, modalModel), size: 'medium' }),
}, 'Export Runs');
