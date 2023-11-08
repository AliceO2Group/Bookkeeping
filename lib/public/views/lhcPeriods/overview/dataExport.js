/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h, iconChevronBottom } from '/js/src/index.js';

export const exportFormats = {
    csv: 'CSV',
    json: 'JSON',
};

export const exportPreferences = {
    all: 'all',
    currentPage: 'currentPage',
    selected: 'selected',
    notSelected: 'notSelected',
    visible: 'visible',
};

const rowsPreferenceSelectId = 'rows-preference-selection';
const columnsPreferenceSelectId = 'columns-preference-selection';
const exportFormatSelectId = 'export-format-selection';

const exportData = async (dataModel, close) => {
    const remoteData = dataModel.currentPageData;

    remoteData.match({
        NotAsked: () => {},
        Loading: () => {},
        Success: async () => {
            await dataModel.createDataExport(remoteData.payload, selectedDataFormat());
        },
        Failure: () => {},
    });
    close();
};

const selectedDataFormat = () => {
    const exportFormatSelection = document.getElementById(exportFormatSelectId);
    const selectedFormat = exportFormatSelection.options[exportFormatSelection.selectedIndex].value;
    switch (selectedFormat) {
        case exportFormats.csv:
            return selectedFormat;
        case exportFormats.json:
            return selectedFormat;
        default:
            return selectedFormat.csv;
    }
};

export default function dataExport(close, dataModel) {
    const pageName = dataModel.name;

    const title = h('h3.text-primary', `${pageName} export`);

    return h('.p-1rem', [
        h('.flex.p-bottom-1rem.items-center',
            h('', title)),

        h('.flex-wrap.justify-between.items-center',
            h('.text-dark-blue', 'Rows'),
            h('select.select.color-theme', {
                id: rowsPreferenceSelectId,
                name: rowsPreferenceSelectId,
            }, [
                h('option', { value: exportPreferences.all, disabled: true }, 'All'),
                h('option', { value: exportPreferences.currentPage }, 'Current page'),
                h('option', { value: exportPreferences.selected, disabled: true }, 'Selected rows'),
                h('option', { value: exportPreferences.notSelected, disabled: true }, 'Not selected rows'),
                h('option', { value: exportPreferences.visible, disabled: true }, 'Visible rows'),
            ], iconChevronBottom())),

        h('.flex-wrap.justify-between.items-center',
            h('.text-dark-blue', 'Columns'),
            h('select.select.color-theme', {
                id: columnsPreferenceSelectId,
                name: columnsPreferenceSelectId,
            }, [
                h('option', { value: exportPreferences.all }, 'All'),
                h('option', { value: exportPreferences.selected, disabled: true }, 'Selected columns'),
                h('option', { value: exportPreferences.notSelected, disabled: true }, 'Not selected columns'),
                h('option', { value: exportPreferences.notSelected, disabled: true }, 'Visible columns'),
            ], iconChevronBottom())),

        h('.flex-wrap.justify-between.items-center',
            h('.text-dark-blue', 'Data format'),
            h('select.select.color-theme', {
                id: exportFormatSelectId,
                name: exportFormatSelectId,
            }, [
                h('option', { value: exportFormats.csv }, exportFormats.csv),
                h('option', { value: exportFormats.json }, exportFormats.json),
            ], iconChevronBottom())),

        h('.flex-wrap.justify-center.items-center.p-1rem.p-bottom-0',
            h('button.btn.btn-primary', {
                onclick: async () => await exportData(dataModel, close),
            }, 'Download file')),
    ]);
}
