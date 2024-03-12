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

/**
 * Export form component, containing the fields to export, the export type and the export button
 *
 * @param {OverviewPageModel} model the runsOverviewModel
 * @param {object[]} items the runs to export
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 * @param {object} activeColumns active columns
 * @return {vnode[]} the form component
 */
const exportForm = (model, items, modalHandler, activeColumns) => {
    const exportTypes = ['JSON', 'CSV'];
    const selectedRunsFields = model.getSelectedRunsFields() || [];
    const selectedExportType = model.getSelectedExportType() || exportTypes[0];
    const runsFields = Object.keys(activeColumns);
    const enabled = selectedRunsFields.length > 0 && items;

    return [
        model.areExportItemsTruncated
            ? h(
                '#truncated-export-warning.warning',
                `The runs export is limited to ${items.length} entries, only the last runs will be exported (sorted by run number)`,
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
            onchange: ({ target }) => model.setSelectedRunsFields(target.selectedOptions),
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
                    onclick: () => model.setSelectedExportType(exportType),
                }),
                h('label.form-check-label', {
                    for: id,
                }, exportType),
            ]);
        })),
        h('button.shadow-level1.btn.btn-success.mt2#send', {
            disabled: !enabled,
            onclick: async () => {
                await model.createRunsExport(
                    items,
                    'runs',
                    activeColumns,
                );
                modalHandler.dismiss();
            },
        }, items ? 'Export' : 'Loading data'),
    ];
};

// eslint-disable-next-line require-jsdoc
const errorDisplay = () => h('.danger', 'Data fetching failed');

/**
 * A function to construct the exports runs screen
 * @param {OverviewPageModel} model Pass the model to access the defined functions
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 * @param {object} activeColumns active columns
 * @return {Component} Return the view of the inputs
 */
const exportModal = (model, modalHandler, activeColumns) => {
    model.loadExport();

    return h('div#export-modal', [
        h('h2', 'Export'),
        model.exportItems.match({
            NotAsked: () => errorDisplay(),
            Loading: () => exportForm(model, null, modalHandler, activeColumns),
            Success: (payload) => exportForm(model, payload, modalHandler, activeColumns),
            Failure: () => errorDisplay(),
        }),
    ]);
};

/**
 * Builds a button which will open popover for data export
 * @param {OverviewPageModel} model runs overview model
 * @param {ModelModel} modalModel modal model
 * @param {object} activeColumns active columns
 * @returns {Component} button
 */
export const exportTriggerAndModal = (model, modalModel, activeColumns) => h('button.btn.btn-primary.w-15.h2.mlauto#export-trigger', {
    disabled: model.items.match({
        Success: (payload) => payload.length === 0,
        NotAsked: () => true,
        Failure: () => true,
        Loading: () => true,
    }),
    onclick: () => modalModel.display({ content: (modalModel) => exportModal(model, modalModel, activeColumns), size: 'medium' }),
}, 'Export');
