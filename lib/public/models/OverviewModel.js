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

        this._allObservableItems = ObservableData.builder().initialValue(RemoteData.loading()).build();
        this._allObservableItems.bubbleTo(this);
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
        await this._dataSource.fetch(buildUrl(this.getRootEndpoint(), params));
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
     * Return the current items remote data
     *
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
