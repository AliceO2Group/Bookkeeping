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
 * @param {RunsOverviewModel} exportModel the runsOverviewModel
 * @param {array} runs the runs to export
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 *
 * @return {vnode[]} the form component
 */
const exportForm = (exportModel, modalHandler) => {
    const exportTypes = ['JSON', 'CSV'];

    const { selectedFields } = exportModel;
    const { selectedExportType } = exportModel;
    const fields = Object.keys(exportModel.columnFormats);

    const fieldsSelected = selectedFields.length > 0;

    const fieldsSelectionHeader1 = h('label.form-check-label.f4.mt1', { for: '' }, 'Fields');
    const fieldsSelectionHeader2 = h(
        'label.form-check-label.f6',
        { for: '' },
        'Select which fields to be exported. (CTRL + click for multiple selection)',
    );

    const fieldsSelection = h('select#fields.form-control', {
        style: 'min-height: 20rem;',
        multiple: true,
        onchange: ({ target }) => exportModel.setSelectedFields(target.selectedOptions),
    }, [
        ...fields
            .filter((name) => !['id', 'actions'].includes(name))
            .map((name) => h('option', {
                value: name,
                selected: selectedFields.length ? selectedFields.includes(name) : false,
            }, name)),
    ]);

    const exportTypeSelectionHeader1 = h('label.form-check-label.f4.mt1', { for: '' }, 'Export type');
    const exportTypeSelectionHeader2 = h('label.form-check-label.f6', { for: '' }, 'Select output format');

    const exportTypeSelect = h('.flex-row.g3', exportTypes.map((exportType) => {
        const id = `runs-export-type-${exportType}`;
        return h('.form-check', [
            h('input.form-check-input', {
                id,
                type: 'radio',
                value: exportType,
                checked: selectedExportType.length ? selectedExportType.includes(exportType) : false,
                name: 'export-type',
                onclick: () => exportModel.setSelectedExportType(exportType),
            }),
            h('label.form-check-label', {
                for: id,
            }, exportType),
        ]);
    }));

    const dataAvailable = exportModel.items.match({ Success: () => true, Other: () => false });

    const exportBtn = h('button.shadow-level1.btn.btn-success.mt2#send', {
        disabled: !(fieldsSelected && dataAvailable),
        onclick: async () => {
            await exportModel.createExport();
            modalHandler.dismiss();
        },
    }, dataAvailable ? 'Export' : 'Loading data');

    const dataLength = exportModel.items.match({ Success: ({ length } = {}) => length, Other: () => null });
    const { totalExistingItemsCount } = exportModel;
    return [
        dataLength && dataLength < totalExistingItemsCount
            ? h(
                '#truncated-export-warning.warning',
                `The data export is limited to ${dataLength} entries, only the last data will be exported`,
            )
            : null,
        fieldsSelectionHeader1,
        fieldsSelectionHeader2,
        fieldsSelection,
        exportTypeSelectionHeader1,
        exportTypeSelectionHeader2,
        exportTypeSelect,
        exportBtn,
    ];
};

const errorDisplay = () => h('.danger', 'Data fetching failed');

/**
 * A function to construct the exports runs screen
 *
 * @param {ExportModel} exportModel pass the model to access the defined functions
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 * @return {Component} Return the view of the inputs
 */
const exportModal = (exportModel, modalHandler) => {
    exportModel.askForData();
    return h('div#export-runs-modal', [
        h('h2', 'Export data'),
        exportModel.items.match({
            NotAsked: () => errorDisplay(),
            Failure: () => errorDisplay(),
            Other: () => exportForm(exportModel, modalHandler),
        }),
    ]);
};

/**
 * Builds a button which will open popover for data export
 *
 * @param {ExportModel} exportModel runs overview model
 * @param {ModelModel} modalModel modal model
 * @param {object} [displayConfiguration] additional display options
 * @param {boolean} [displayConfiguration.autoMarginLeft = true] if true margin left is set to auto, otherwise not
 * @returns {Component} button
 */
export const exportTriggerAndModal = (exportModel, modalModel, { autoMarginLeft = true } = {}) =>
    h(`button.btn.btn-primary${autoMarginLeft ? '.mlauto' : ''}#export-runs-trigger`, {
        disabled: exportModel.disabled,
        onclick: () => modalModel.display({ content: (modalModel) => exportModal(exportModel, modalModel), size: 'medium' }),
    }, 'Export data');
