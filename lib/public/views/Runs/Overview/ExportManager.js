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

import { Observable } from '/js/src/index.js';
import { createCSVExport, createJSONExport } from '../../../utilities/export.js';
import pick from '../../../utilities/pick.js';

export const EXPORT_TYPES = ['JSON', 'CSV'];

/**
 * @typedef ExportableData
 * @type {object[]}
 */

/**
 * Class for managing export of data
 */
export class ExportManager extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._selectedFields = [];
        // eslint-disable-next-line prefer-destructuring
        this._exportType = EXPORT_TYPES[0];
    }

    /**
     * 
     */
    async createExport(exportData, fileName, exportFormats) {
        // if (exportData.length > 0) {
        const exportableData = exportData.map((dataUnit) => {
            const formattedEntries = Object
                .entries(pick(dataUnit, this._selectedFields || []))
                .map(([key, value]) => {
                    const formatExport = exportFormats[key].exportFormat || ((identity) => identity);
                    return [key, formatExport(value, dataUnit)];
                });
            return Object.fromEntries(formattedEntries);
        });
        this._exportType === 'CSV'
            ? createCSVExport(exportableData, `${fileName}.csv`, 'text/csv;charset=utf-8;')
            : createJSONExport(exportableData, `${fileName}.json`, 'application/json');
        // } 
        // else {
        //     this._exportItems.setCurrent(RemoteData.failure([
        //         {
        //             title: 'No data found',
        //             detail: 'No valid runs were found for provided run number(s)',
        //         },
        //     ]));
        //     this.notify();
        // }
    }

    get areExportItemsTruncated() {
        return this._areExportItemsTruncated;
    }

    set areExportItemsTruncated(areExportItemsTruncated) {
        return this._areExportItemsTruncated = areExportItemsTruncated;
    }

    /**
     * Set export type
     * @param {string} exportType export type
     */
    set exportType(exportType) {
        this._exportType = exportType;
    }

    /**
     * Get export type
     */
    get exportType() {
        return this._exportType;
    }

    /**
     * Set fields to be selected
     * @param {string[]} selectedFields selected fields
     */
    set selectedFields(selectedFields) {
        this._selectedFields = selectedFields;
    }

    /**
     * Get Selected fields
     * @return {string[]} fields list
     */
    get selectedFields() {
        return this._selectedFields;
    }
}
