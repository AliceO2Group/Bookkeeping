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

import { DATA_EXPORT_TYPES } from '../../../domain/enums/DataExportTypes.js';
import errorAlert from '../errorAlert.js';
import spinner from '../spinner.js';
import { h } from '/js/src/index.js';

/**
 * Export form component, containing the fields to export, the export type and the export button
 *
 * @param {DataExportModel} exportModel export model
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 *
 * @return {Component} the form component
 */
const exportForm = (exportModel, modalHandler) => {
    const { selectedFields, selectedExportType, dataExportConfiguration } = exportModel;
    const fields = Object.keys(dataExportConfiguration);

    const fieldsSelected = selectedFields.length > 0;

    const fieldsSelectionLabels = [
        h('label.form-check-label.f4.mt1', { for: 'fields' }, 'Fields'),
        h(
            'label.form-check-label.f6',
            { for: 'fields' },
            'Select which fields to be exported. (CTRL + click for multiple selection)',
        ),
    ];

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

    const exportTypeSelectionLabels = [
        h('label.form-check-label.f4.mt1', 'Export type'),
        h('label.form-check-label.f6', 'Select output format'),
    ];

    const exportTypeSelect = h('.flex-row.g3', DATA_EXPORT_TYPES.map((exportType) => {
        const id = `data-export-type-${exportType}`;
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

    const exportBtn = h('button.shadow-level1.btn.btn-success.mt2#send', {
        disabled: !fieldsSelected,
        onclick: async () => {
            await exportModel.createExport();
            modalHandler.dismiss();
        },
    }, 'Export');

    const dataLength = exportModel.items.match({ Success: ({ length } = {}) => length, Other: () => null });
    const { totalExistingItemsCount } = exportModel;

    const truncatedDataInfo = dataLength && dataLength < totalExistingItemsCount
        ? h(
            '#truncated-export-warning.warning',
            `The data export is limited to ${dataLength} entries, only the most recent data will be exported`,
        )
        : null;

    return [
        truncatedDataInfo,
        fieldsSelectionLabels,
        fieldsSelection,
        exportTypeSelectionLabels,
        exportTypeSelect,
        exportBtn,
    ];
};

/**
 * A function to construct the exports data screen
 *
 * @param {DataExportModel} exportModel export model
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 * @return {Component} Return the view of the inputs
 */
const exportModal = (exportModel, modalHandler) => {
    exportModel.callForData();

    return h('div#export-data-modal', [
        h('h2.w-50', 'Export data'),
        exportModel.items.match({
            NotAsked: () => errorAlert(),
            Failure: (errors) => errorAlert(errors),
            Loading: () => spinner({ size: 2, absolute: false }),
            Other: () => exportForm(exportModel, modalHandler),
        }),
    ]);
};

/**
 * Builds a button which will open popover for data export
 *
 * @param {DataExportModel} exportModel export model
 * @param {ModalModel} modalModel modal model
 * @param {object} [displayConfiguration] additional display options
 * @param {boolean} [displayConfiguration.autoMarginLeft = true] if true margin left is set to auto, otherwise not
 * @returns {Component} button
 */
export const exportTriggerAndModal = (exportModel, modalModel, { autoMarginLeft = true } = {}) =>
    h(`button.btn.btn-primary${autoMarginLeft ? '.mlauto' : ''}#export-data-trigger`, {
        disabled: exportModel.disabled,
        onclick: () => modalModel.display({ content: (modalModel) => exportModal(exportModel, modalModel), size: 'medium' }),
    }, 'Export data');
