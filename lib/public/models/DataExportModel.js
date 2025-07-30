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
import { createCSVExport, createJSONExport } from '../utilities/export.js';
import pick from '../utilities/pick.js';

/**
 * Model handling export configuration and creation
 */
export class DataExportModel extends Observable {
    /**
     * Constructor
     * @param {ObservableData<RemoteData<object[]>>} items$ observable data used as source for export
     * @param {function} onNoDataAction
     */
    constructor(items$, onNoDataAction) {
        super();

        /** @type {ObservableData<RemoteData<object[]>>} */
        this._items$ = items$;
        this._items$.bubbleTo(this);

        /** @type {string[]} */
        this._selectedFields = [];

        /** @type {string} */
        this._selectedExportType = 'JSON';

        /** @type {Observable} */
        this._visualChange$ = new Observable();

        this._exportName = 'data';

        this.columnFormats = null;
        this._onNoDataAction = onNoDataAction;

        this._disabled = null;

        this._totalExistingItemsCount = null;
    }

    get totalExistingItemsCount() {
        return this._totalExistingItemsCount;
    }

    setTotalExistingItemsCount(totalExistingItemsCount) {
        this._totalExistingItemsCount = totalExistingItemsCount;
    }

    get disabled() {
        return this._disabled;
    }

    setDisabled(value) {
        this._disabled = value;
    }

    /**
     * 
     */
    askForData() {
        this.items.match({
            NotAsked: () => this._onNoDataAction(),
            Other: () => null,
        });
    }

    /**
     * Return the current items remote data
     *
     * @return {RemoteData<T[]>} the items
     */
    get items() {
        return this._items$.getCurrent();
    }

    /**
     * Observable notified when the export configuration visually changes
     * @return {Observable}
     */
    get visualChange$() {
        return this._visualChange$;
    }

    /**
     * Get export type selected by the user
     * @return {string} export type
     */
    get selectedExportType() {
        return this._selectedExportType;
    }

    /**
     * Set export type
     * @param {string} exportType export type
     * @return {void}
     */
    setSelectedExportType(exportType) {
        this._selectedExportType = exportType;
        this.notify();
        this._visualChange$.notify();
    }

    /**
     * Get selected fields
     * @return {string[]} selected fields
     */
    get selectedFields() {
        return this._selectedFields;
    }

    /**
     * Update selected fields from HTML options list
     * @param {HTMLCollection|Array} selectedOptions options collection
     * @return {void}
     */
    setSelectedFields(selectedOptions) {
        this._selectedFields = [];
        [...selectedOptions].forEach(({ value }) => this._selectedFields.push(value));
        this.notify();
        this._visualChange$.notify();
    }

    /**
     * Create export using current items observable
     * @return {Promise<void>} void
     */
    async createExport() {
        this.items.apply({
            Success: (items) => {
                const { selectedFields } = this;

                const formatted = items.map((item) => {
                    const selectedEntries = Object.entries(pick(item, selectedFields));
                    const mappedEntries = selectedEntries.map(([key, value]) => {
                        const formatter = this.columnFormats[key]?.exportFormat || ((v) => v);
                        return [key, formatter(value, item)];
                    });

                    return Object.fromEntries(mappedEntries);
                });

                this.selectedExportType === 'CSV'
                    ? createCSVExport(formatted, `${this._exportName}.csv`, 'text/csv;charset=utf-8;')
                    : createJSONExport(formatted, `${this._exportName}.json`, 'application/json');
            },
        });
    }
}
