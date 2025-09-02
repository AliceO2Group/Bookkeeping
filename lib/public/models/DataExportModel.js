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
import { DataExportTypes } from '../domain/enums/DataExportTypes.js';

/**
 * @typedef FieldExportConfiguration
 *
 * @property {function|null} exportFormat
 */

/**
 * @typedef DataExportConfiguration
 *
 * @type {object<string, FieldExportConfiguration>} mapping: field name -> field export configuration
 */

/**
 * Model handling export configuration and creation
 */
export class DataExportModel extends Observable {
    /**
     * Constructor
     *
     * @param {ObservableData<RemoteData<T[]>>} items$ observable data used as source for export
     * @param {DataExportConfiguration} dataExportConfiguration defines selectable fields and their formatting
     * @param {function} onDataNotAskedAction function to be called in case of missing data
     */
    constructor(items$, dataExportConfiguration, onDataNotAskedAction) {
        super();

        this._items$ = items$;
        this._items$.bubbleTo(this);

        this._selectedFields = [];

        this._selectedExportType = DataExportTypes.JSON;

        this._exportName = 'data';

        this._dataExportConfiguration = dataExportConfiguration;
        this._onDataNotAskedAction = onDataNotAskedAction;

        this._disabled = null;

        this._totalExistingItemsCount = null;
    }

    /**
     * Get data export configuration
     *
     * @return {DataExportConfiguration} configuration
     */
    get dataExportConfiguration() {
        return this._dataExportConfiguration;
    }

    /**
     * Get data export configuration
     *
     * @param {DataExportConfiguration} dataExportConfiguration defines selectable fields and their formatting
     */
    setDataExportConfiguration(dataExportConfiguration) {
        this._dataExportConfiguration = dataExportConfiguration;
    }

    /**
     * Get total number of items that model knows they exist
     *
     * @return {number} totalExistingItemsCount
     */
    get totalExistingItemsCount() {
        return this._totalExistingItemsCount;
    }

    /**
     * Set total number of items that model should they exist
     * @param {number} totalExistingItemsCount count
     */
    setTotalExistingItemsCount(totalExistingItemsCount) {
        this._totalExistingItemsCount = totalExistingItemsCount;
        this.notify();
    }

    /**
     * State whether exporting is enabled
     * @return {boolean} if true disabled, otherwise enabled
     */
    get disabled() {
        return this._disabled;
    }

    /**
     * Set whether exporting is enabled
     * @param {boolean} disabled if true disabled, otherwise enabled
     */
    setDisabled(disabled) {
        this._disabled = disabled;
        this.notify();
    }

    /**
     * If the model has no data to be exported, it calls for it via action function provided in constructor
     * @return {Promise<void>|null} promise if data were not asked for, null otherwise
     */
    callForData() {
        if (this._onDataNotAskedAction) {
            return this.items.match({
                NotAsked: () => this._onDataNotAskedAction(),
                Other: () => null,
            });
        } else {
            throw new Error('onDataNotAskedAction was not provided');
        }
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
     * Get export type selected by the user
     *
     * @return {string} export type
     */
    get selectedExportType() {
        return this._selectedExportType;
    }

    /**
     * Set export type
     *
     * @param {string} exportType export type
     * @return {void}
     */
    setSelectedExportType(exportType) {
        this._selectedExportType = exportType;
        this.notify();
    }

    /**
     * Get selected fields
     *
     * @return {string[]} selected fields
     */
    get selectedFields() {
        return this._selectedFields;
    }

    /**
     * Update selected fields from HTML options list
     *
     * @param {HTMLCollection|Array} selectedOptions options collection
     * @return {void}
     */
    setSelectedFields(selectedOptions) {
        this._selectedFields = Array.from(selectedOptions).map(({ value }) => value);
        this.notify();
    }

    /**
     * Create export using current items observable
     *
     * @return {Promise<void>} void
     */
    async createExport() {
        this.items.apply({
            Success: (items) => {
                const { selectedFields } = this;

                const formatted = items.map((item) => {
                    const mappedEntries = selectedFields.map((key) => {
                        const formatter = this.dataExportConfiguration[key]?.exportFormat[this.selectedExportType]
                            ?? this.dataExportConfiguration[key]?.exportFormat
                            ?? ((v) => v);

                        return [key, formatter(item[key], item)];
                    });

                    return Object.fromEntries(mappedEntries);
                });

                this.selectedExportType === DataExportTypes.JSON
                    ? createJSONExport(formatted, `${this._exportName}.json`, 'application/json')
                    : createCSVExport(formatted, `${this._exportName}.csv`, 'text/csv;charset=utf-8;');
            },
        });
    }
}
