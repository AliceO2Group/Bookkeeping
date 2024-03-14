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

import spinner from '../../../components/common/spinner.js';
import { EXPORT_FORMATS } from '../../../models/OverviewModel.js';
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
    const { exportFormat: currentExportFormat, exportFields, areExportItemsTruncated } = model;
    const selectableFields = Object.keys(activeColumns);

    return [
        areExportItemsTruncated
            ? h(
                '#truncated-export-warning.warning',
                `The items export is limited to ${items.length} entries, only the last items will be exported`,
            )
            : null,
        h('label.form-check-label.f4.mt1', { for: 'export-fields' }, 'Fields'),
        h(
            'label.form-check-label.f6',
            { for: 'export-fields' },
            'Select which fields to be exported. (CTRL + click for multiple selection)',
        ),
        h('select#fields.form-control', {
            style: 'min-height: 20rem;',
            multiple: true,
            id: 'export-fields',
            // eslint-disable-next-line no-return-assign
            onchange: ({ target: { selectedOptions } }) => model.exportFields = selectedOptions,
        }, [
            ...selectableFields
                .filter((name) => !['id', 'actions'].includes(name))
                .map((name) => h('option', {
                    value: name,
                    selected: exportFields.length ? exportFields.includes(name) : false,
                }, name)),
        ]),
        h('.flex-row.justify-between', [
            h('', [
                h('label.form-check-label.f4.mt1', 'Export format'),
                h('label.form-check-label.f6', 'Select output format'),
                h('.flex-row.g3', Object.values(EXPORT_FORMATS).map((exportFormat) => {
                    const id = `runs-export-type-${exportFormat}`;
                    return h('.form-check', [
                        h('input.form-check-input', {
                            id,
                            type: 'radio',
                            value: exportFormat,
                            checked: exportFormat === currentExportFormat,
                            name: 'runs-export-type',
                            // eslint-disable-next-line no-return-assign
                            onclick: () => model.exportFormat = exportFormat,
                        }),
                        h('label.form-check-label', {
                            for: id,
                        }, exportFormat),
                    ]);
                })),
            ]),

            h('', [
                h('label.form-check-label.f4.mt1', { for: 'export-name' }, 'Export name'),
                h('input', {
                    id: 'export-name',
                    value: model.exportName,
                    // eslint-disable-next-line no-return-assign
                    onchange: ({ target: { value: currentText } }) => model.exportName = currentText,
                }),
            ]),
        ]),
        h('button.shadow-level1.btn.btn-success.mt2#download-export', {
            disabled: exportFields.length === 0,
            onclick: async () => {
                await model.export(
                    items,
                    activeColumns,
                );
                await modalHandler.dismiss();
            },
        }, 'Export'),
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
            Loading: () => spinner({ size: 3, absolute: false }),
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
