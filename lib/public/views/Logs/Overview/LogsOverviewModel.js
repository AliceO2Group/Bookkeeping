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
     * @param {string} pageIdentifier string that indicates what page this model represents
     */
    constructor(model, excludeAnonymous = false, pageIdentifier) {
        super();
        this._warnings = new Map();

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
            },
            this._warnings,
        );

        this._overviewSortModel = new SortModel();
        this._pagination = new PaginationModel();
        const updateDebounceTime = () => {
            this._debouncedLoad = debounce(this.load.bind(this), model.inputDebounceTime);
        };

        updateDebounceTime();
        model.appConfiguration$.observe(() => updateDebounceTime());

        // Filters
        this.filteringModel.pageIdentifier = pageIdentifier;
        excludeAnonymous && this._filteringModel.get('author').update('!Anonymous');
        this._filteringModel.observe(() => this._applyFilters());
        this._filteringModel.visualChange$.bubbleTo(this);

        // Sub-models
        this._sortModel.observe(() => this._applyFilters(true));
        this._sortModel.visualChange$.bubbleTo(this);

        this._pagination.observe(() => this.load());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this._item$ = RemoteData.NotAsked();
    }

    /**
     * Set underlying FilteringModel's filters from the query parameters in the URL
     *
     * @param {boolean} notify if the FilteringModel should notify it's observers after finishing setting the filters
     */
    setFilterFromURL(notify) {
        this._filteringModel.setFilterFromURL(notify);
    }

    /**
     * Retrieve every relevant log from the API
     * @returns {Promise<void>} Injects the data object with the response data
     */
    async load() {
        const keepExisting = this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled;
        const sortOn = this._sortModel.appliedOn;
        const sortDirection = this._sortModel.appliedDirection;

        if (!keepExisting) {
            this._item$ = RemoteData.loading();
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
            const concatenateWith = keepExisting ? this._item$.payload ?? [] : [];
            this._item$ = RemoteData.success([...concatenateWith, ...items]);
            this._pagination.itemsCount = totalCount;
        } catch (errors) {
            this._item$ = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Return current logs
     * @return {RemoteData<*[]>} current data
     */
    get items() {
        return this._item$;
    }

    /**
     * Reset all filtering, sorting and pagination settings to their default values
     *
     * @param {boolean} _fetch Whether to refetch all data after filters have been reset
     * @param {boolean} [clearUrl=false] if true filters will be removed from the url
     * @return {void}
     */
    reset(_fetch = true, clearUrl = false) {
        this._filteringModel.reset(false, clearUrl);
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
    get sortModel() {
        return this._sortModel;
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
     * Returns the warnings object
     *
     * @return {object} the warning model
     */
    get warnings() {
        return this._warnings;
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
        now ? this.load() : this._debouncedLoad();
    }
}
