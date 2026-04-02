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

import { buildUrl, Observable, RemoteData } from '/js/src/index.js';
import { TagFilterModel } from '../../../components/Filters/common/TagFilterModel.js';
import { SortModel } from '../../../components/common/table/SortModel.js';
import { debounce } from '../../../utilities/debounce.js';
import { AuthorFilterModel } from '../../../components/Filters/LogsFilter/author/AuthorFilterModel.js';
import { PaginationModel } from '../../../components/Pagination/PaginationModel.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';
import { tagsProvider } from '../../../services/tag/tagsProvider.js';
import { FilteringModel } from '../../../components/Filters/common/FilteringModel.js';
import { RawTextFilterModel } from '../../../components/Filters/common/filters/RawTextFilterModel.js';
import { TimeRangeInputModel } from '../../../components/Filters/common/filters/TimeRangeInputModel.js';

/**
 * Model representing handlers for log entries page
 *
 * @implements {OverviewModel}
 */
export class LogsOverviewModel extends Observable {
    /**
     * The constructor of the Overview model object
     *
     * @param {Model} model global model
     * @param {boolean} excludeAnonymous Whether to exclude anonymous logs
     */
    constructor(model, excludeAnonymous = false) {
        super();

        this._filteringModel = new FilteringModel(
            model.router,
            {
            author: new AuthorFilterModel(),
            title: new RawTextFilterModel(),
            content: new RawTextFilterModel(),
            tags: new TagFilterModel(tagsProvider.items$),
            runNumbers: new RawTextFilterModel(),
            environmentIds: new RawTextFilterModel(),
            fillNumbers: new RawTextFilterModel(),
            created: new TimeRangeInputModel(),
        });

        this._filteringModel.pageIdentifiers = ['log-overview'];
        this._filteringModel.observe(() => this._applyFilters());
        this._filteringModel.visualChange$.bubbleTo(this);

        // Sub-models
        this._overviewSortModel = new SortModel();
        this._overviewSortModel.observe(() => this._applyFilters(true));
        this._overviewSortModel.visualChange$.bubbleTo(this);

        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchLogs());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this._logs = RemoteData.NotAsked();

        const updateDebounceTime = () => {
            this._debouncedFetchAllLogs = debounce(this.fetchLogs.bind(this), model.inputDebounceTime);
        };
        model.appConfiguration$.observe(() => updateDebounceTime());
        updateDebounceTime();

        excludeAnonymous && this._filteringModel.get('author').update('!Anonymous');

        this.reset(false);
        this._filteringModel.setFilterFromURL();
    }

    /**
     * Retrieve every relevant log from the API
     * @returns {Promise<void>} Injects the data object with the response data
     */
    async fetchLogs() {
        const keepExisting = this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled;
        const sortOn = this._overviewSortModel.appliedOn;
        const sortDirection = this._overviewSortModel.appliedDirection;

        if (!keepExisting) {
            this._logs = RemoteData.loading();
            this.notify();
        }

        const params = {
            ...sortOn && sortDirection && {
                [`sort[${sortOn}]`]: sortDirection,
            },
            filter: this._filteringModel.normalized,
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
        };

        const endpoint = buildUrl('/api/logs', params);

        try {
            const { items, totalCount } = await getRemoteDataSlice(endpoint);
            const concatenateWith = keepExisting ? this._logs.payload ?? [] : [];
            this._logs = RemoteData.success([...concatenateWith, ...items]);
            this._pagination.itemsCount = totalCount;
        } catch (errors) {
            this._logs = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Return current logs
     * @return {RemoteData<*[]>} current data
     */
    get logs() {
        return this._logs;
    }

    /**
     * Reset all filtering, sorting and pagination settings to their default values
     *
     * @param {boolean} fetch Whether to refetch all logs after filters have been reset
     * @return {undefined}
     */
    reset(fetch = true) {
        this._filteringModel.reset();
        this._pagination.reset();

        if (fetch) {
            this._applyFilters(true);
        }
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @returns {boolean} If any filter is active
     */
    isAnyFilterActive() {
        return this._filteringModel.isAnyFilterActive();
    }

    /**
     * Return the model managing all filters
     *
     * @return {FilteringModel} the filtering model
     */
    get filteringModel() {
        return this._filteringModel;
    }

    /**
     * Returns the model handling the overview page table sort
     *
     * @return {SortModel} the sort model
     */
    get overviewSortModel() {
        return this._overviewSortModel;
    }

    /**
     * Returns the pagination model
     *
     * @return {PaginationModel} the pagination model
     */
    get pagination() {
        return this._pagination;
    }

    /**
     * Apply the current filtering and update the remote data list
     *
     * @param {boolean} now if true, filtering will be applied now without debouncing
     *
     * @return {void}
     */
    _applyFilters(now = false) {
        this._pagination.silentlySetCurrentPage(1);
        now ? this.fetchLogs() : this._debouncedFetchAllLogs();
    }
}
