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

import { Observable, RemoteData } from '/js/src/index.js';
import { ObservableData } from '../utilities/ObservableData.js';
import { PaginatedRemoteDataSource } from '../utilities/fetch/PaginatedRemoteDataSource.js';
import { PaginationModel } from '../components/Pagination/PaginationModel.js';
import { buildUrl } from '../utilities/fetch/buildUrl.js';
import pick from '../utilities/pick.js';
import { createCSVExport, createJSONExport } from '../utilities/export.js';

/**
 * Interface of a model representing an overview page state
 *
 * @interface OverviewModel
 */

/**
 * @property {PaginationModel} OverviewModel#pagination pagination model of the overview
 */

/**
 * Base model for an overview page
 *
 * @template T the type of data displayed in the overview page
 */
export class OverviewPageModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.load());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        const dataSourceObservable = ObservableData.builder().initialValue(RemoteData.loading()).build();
        dataSourceObservable.observe(() => this.parseApiRemoteData(dataSourceObservable.getCurrent()));

        this._dataSource = new PaginatedRemoteDataSource();
        this._dataSource.pipe(dataSourceObservable);

        this._observableItems = ObservableData.builder().initialValue(RemoteData.loading()).build();
        this._observableItems.bubbleTo(this);

        this._exportDataSource = new PaginatedRemoteDataSource();
        this._exportObservableItems = ObservableData.builder()
            .initialValue(RemoteData.notAsked())
            .apply((remoteData) => remoteData.apply({ Success: ({ items }) => this.processItems(items) }))
            .build();
        this._exportObservableItems.bubbleTo(this);
        this._exportDataSource.pipe(this._exportObservableItems);
    }

    /**
     * Return the root endpoint for the model to use to fetch data
     *
     * @return {string} the endpoint
     * @abstract
     */
    getRootEndpoint() {
        throw new Error('Abstract function call');
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._observableItems.setCurrent(RemoteData.notAsked());
        this._pagination.reset();
    }

    /**
     * Parse the API remote data to extract the list of items to display and update the pagination
     *
     * @param {RemoteData<{items: T[], totalCount: number}, *>} remoteData the API remote data
     * @return {void}
     */
    parseApiRemoteData(remoteData) {
        /*
         * When fetching data, to avoid concurrency issues, save a flag stating if the fetched data should be concatenated with the current one
         * (infinite scroll) or if they should replace them
         */
        const keepExisting = this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled;

        remoteData.match({
            NotAsked: () => this._observableItems.setCurrent(RemoteData.notAsked()),
            Loading: () => this._pagination.isInfiniteScrollEnabled ? null : this._observableItems.setCurrent(RemoteData.loading()),
            Success: ({ items, totalCount }) => {
                const concatenateWith = keepExisting ? this.items.match({
                    Success: (payload) => payload,
                    Loading: () => [],
                    NotAsked: () => [],
                    Failure: () => [],
                }) : [];
                this._pagination.itemsCount = totalCount;
                this._observableItems.setCurrent(RemoteData.success([...concatenateWith, ...this.processItems(items)]));
            },
            Failure: (error) => this._observableItems.setCurrent(RemoteData.failure(error)),
        });
    }

    /**
     * Apply a processing on each provided items and return the result
     *
     * @param {T[]} items the items to process
     * @return {T[]} The list of processed items
     */
    processItems(items) {
        return items;
    }

    /**
     * Fetch all the relevant items from the API
     *
     * @return {Promise<void>} void
     */
    async load() {
        const params = await this.getLoadParameters();
        this._exportObservableItems.setCurrent(RemoteData.notAsked());
        await this._dataSource.fetch(buildUrl(this.getRootEndpoint(), params));
    }

    /**
     * Fetch all the relevant items from the API
     *
     * @return {Promise<void>} void
     */
    async loadExport() {
        return this._exportObservableItems.getCurrent().match({
            Success: () => null,
            Loading: () => null,
            Other: () => this._exportDataSource.fetch(this.getRootEndpoint()),
        });
    }

    /**
     * Create the export with the variables set in the model, handling errors appropriately
     * @param {object[]} runs The source content.
     * @param {string} fileName The name of the file including the output format.
     * @param {Object<string, Function<*, string>>} exportFormats defines how particual fields of data units will be formated
     * @return {void}
     */
    async createRunsExport(runs, fileName, exportFormats) {
        if (runs.length > 0) {
            const selectedRunsFields = this.getExportFields() || [];
            runs = runs.map((selectedRun) => {
                const entries = Object.entries(pick(selectedRun, selectedRunsFields));
                const formattedEntries = entries.map(([key, value]) => {
                    const formatExport = exportFormats[key].exportFormat || ((identity) => identity);
                    return [key, formatExport(value, selectedRun)];
                });
                return Object.fromEntries(formattedEntries);
            }),
            this.getExportFormat() === 'CSV'
                ? createCSVExport(runs, `${fileName}.csv`, 'text/csv;charset=utf-8;')
                : createJSONExport(runs, `${fileName}.json`, 'application/json');
        } else {
            this._observableItems.setCurrent(RemoteData.failure([
                {
                    title: 'No data found',
                    detail: 'No valid runs were found for provided run number(s)',
                },
            ]));
            this.notify();
        }
    }

    /**
     * Get the field values that will be exported
     * @return {Array} the field objects of the current export being created
     */
    getExportFields() {
        return this._exportFields;
    }

    /**
     * Get the output format of the export
     * @return {string} the output format
     */
    getExportFormat() {
        return this._exportFormat;
    }

    /**
     * Set the export type parameter of the current export being created
     * @param {string} exportFormat Received string from the view
     * @return {void}
     */
    setExportFormat(exportFormat) {
        this._exportFormat = exportFormat;
        this.notify();
    }

    /**
     * Updates the selected fields ID array according to the HTML attributes of the options
     *
     * @param {HTMLCollection} exportFields The currently selected fields by the user,
     * according to HTML specification
     * @return {void}
     */
    setExportFields(exportFields) {
        this._exportFields = [];
        [...exportFields].map((selectedOption) => this._exportFields.push(selectedOption.value));
        this.notify();
    }

    /**
     * Return the query params to use to get load the overview data
     *
     * @return {Promise<Object<string, number|string|number[]|string[]>>} the params
     */
    async getLoadParameters() {
        return {
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
        };
    }

    /**
     * States if the list of NOT paginated runs contains the full list of runs available under the given criteria
     *
     * @return {boolean|null} true if the runs list is not truncated (null if all items are not yet available)
     */
    get areExportItemsTruncated() {
        return this.exportItems.match({
            Success: (payload) => this.items.match({
                Success: () => payload.length < this._pagination.itemsCount,
                Other: () => null,
            }),
            Other: () => null,
        });
    }

    /**
     * Return the export items remote data
     * @return {RemoteData<T[]>} the items
     */
    get exportItems() {
        return this._exportObservableItems.getCurrent();
    }

    /**
     * Return the current items remote data
     * @return {RemoteData<T[]>} the items
     */
    get items() {
        return this._observableItems.getCurrent();
    }

    /**
     * Returns the overview pagination
     *
     * @return {PaginationModel} the pagination
     */
    get pagination() {
        return this._pagination;
    }
}
