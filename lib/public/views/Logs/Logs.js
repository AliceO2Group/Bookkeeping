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

import { fetchClient, Observable, RemoteData } from '/js/src/index.js';
import { TagFilterModel } from '../../components/Filters/common/TagFilterModel.js';
import { SortModel } from '../../components/common/table/SortModel.js';
import { debounce, INPUT_DEBOUNCE_TIME } from '../../utilities/debounce.js';
import { taggedEventRegistry } from '../../utilities/taggedEventRegistry.js';
import { FILTER_PANEL_CLICK_TAG } from '../../components/Filters/filtersConstants.js';
import { FilterInputModel } from '../../components/Filters/common/filters/FilterInputModel.js';
import { LogCreationModel } from './Create/LogCreationModel.js';
import { PaginationModel } from '../../components/Pagination/PaginationModel.js';

/**
 * Model representing handlers for log entries page
 *
 * @implements {OverviewModel}
 */
export default class LogModel extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Object} model Pass the model to access the defined functions
     * @returns {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this.model = model;

        // Sub-models
        this._listingTagsFilterModel = new TagFilterModel();
        this._listingTagsFilterModel.observe(() => this._applyFilters());

        this._creationModel = new LogCreationModel();

        this._overviewSortModel = new SortModel();
        this._overviewSortModel.observe(() => this._applyFilters(true));
        this._overviewSortModel.visualChange$.bubbleTo(this);

        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchAllLogs());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        // Filtering models
        this._authorFilter = new FilterInputModel();
        this._registerFilter(this._authorFilter);

        this._titleFilter = new FilterInputModel();
        this._registerFilter(this._titleFilter);

        // Register tagged event listener to close filter if click outside
        taggedEventRegistry.addListenerForAnyExceptTagged(() => this.setShowFilters(false), FILTER_PANEL_CLICK_TAG);

        this.clearLogs();
        this.reset(false);

        this._debouncedFetchAllLogs = debounce(this.fetchAllLogs.bind(this), INPUT_DEBOUNCE_TIME);
    }

    /**
     * Initialize a new model to create a new log
     *
     * @param {string|string} runNumber optionally a run number to which new log must be attached to
     * @param {number|null} parentLogId optionally the id of the parent log to which the created log must be linked to
     * @return {void}
     */
    loadCreation(runNumber, parentLogId) {
        this._creationModel = new LogCreationModel(
            (logId) => this.model.router.go(`/?page=log-detail&id=${logId}`),
            runNumber,
            parentLogId,
        );
        this._creationModel.bubbleTo(this);
    }

    /**
     * Retrieve every relevant log from the API
     *
     * @param {boolean} clear if true, any previous data will be discarded, even in infinite mode
     *
     * @returns {void} Injects the data object with the response data
     */
    async fetchAllLogs(clear = false) {
        if (!this._pagination.isInfiniteScrollEnabled) {
            this.logs = RemoteData.loading();
            this.notify();
        }

        const params = {
            ...this._getFilterQueryParams(),
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
        };

        const endpoint = `/api/logs?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            if (!clear && this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled) {
                const payload = this.logs && this.logs.payload ? [...this.logs.payload, ...result.data] : result.data;
                this.logs = RemoteData.success(payload);
            } else {
                this.logs = RemoteData.success(result.data);
            }
            this._pagination.itemsCount = result.meta.page.totalCount;
        } else {
            this.logs = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }

        this.notify();
    }

    /**
     * Retrieve a specified log from the API
     * @param {Number} id The ID of the log to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchOneLog(id) {
        this.logs = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/logs/${id}/tree`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.logs = RemoteData.success([result.data]);
        } else {
            this.logs = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.detailed_post_ids = [];
        this.posts = [];
        this.showAllPosts = true;
        this.notify();
    }

    /**
     * Getter for all the data
     * @returns {RemoteData} Returns all of the filtered logs
     */
    getLogs() {
        return this.logs;
    }

    /**
     * Getter for all the detailed log entry ids
     * @returns {array} Returns all of the detailed log ids
     */
    getDetailedPosts() {
        return this.detailed_post_ids;
    }

    /**
     * Toggles view mode of all posts in detailed view
     * @returns {undefined}
     */
    toggleAllPostView() {
        this.detailed_post_ids = this.showAllPosts ? this.posts : [];
        this.showAllPosts = !this.showAllPosts;
        this.notify();
    }

    /**
     * Getter for show/collapse all button state
     * @returns {boolean} Button state
     */
    isShowAll() {
        return this.showAllPosts;
    }

    /**
     * Function for adding post in detailed view posts list
     * @param {Integer} post_id ID of post to add
     * @returns {undefined}
     */
    addPost(post_id) {
        if (!(post_id in this.posts)) {
            this.posts.push(post_id);
        }
    }

    /**
     * Show log entry in detailed view
     * @param {Integer} id of log to show detailed
     * @returns {undefined}
     */
    showPostDetailed(id) {
        this.detailed_post_ids.push(id);
        this.notify();
    }

    /**
     * Show log entry collapsed
     * @param {Integer} id of log to collapsed
     * @returns {undefined}
     */
    collapsePost(id) {
        const index = this.detailed_post_ids.indexOf(id, 0);
        if (index > -1) {
            this.detailed_post_ids.splice(index, 1);
        }
        this.notify();
    }

    /**
     * Reset all filtering, sorting and pagination settings to their default values
     *
     * @param {Boolean} fetch Whether to refetch all logs after filters have been reset
     * @return {undefined}
     */
    reset(fetch = true) {
        this.activeFilters = [];

        this.titleFilter.reset();
        this.authorFilter.reset();

        this.createdFilterFrom = '';
        this.createdFilterTo = '';

        this.listingTagsFilterModel.reset();

        this.runFilterOperation = 'AND';
        this.runFilterValues = [];

        this._pagination.reset();

        if (fetch) {
            this._applyFilters(true);
        }
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @returns {Boolean} If any filter is active
     */
    isAnyFilterActive() {
        return (
            !this._titleFilter.isEmpty
            || !this._authorFilter.isEmpty
            || this.createdFilterFrom !== ''
            || this.createdFilterTo !== ''
            || !this.listingTagsFilterModel.isEmpty()
            || this.runFilterValues.length !== 0
        );
    }

    /**
     * Returns active filters
     * @returns {array} array of active filters
     */
    getActiveFilters() {
        this.activeFilters = [];

        if (!this._titleFilter.isEmpty) {
            this.activeFilters.push('Title');
        }
        if (!this._authorFilter.isEmpty) {
            this.activeFilters.push('Author');
        }
        if (this.createdFilterFrom !== '') {
            this.activeFilters.push('Created from');
        }
        if (this.createdFilterTo !== '') {
            this.activeFilters.push('Created to');
        }
        if (!this.listingTagsFilterModel.isEmpty()) {
            this.activeFilters.push('Tags');
        }
        if (this.runFilterValues.length !== 0) {
            this.activeFilters.push('Runs');
        }

        return this.activeFilters;
    }

    /**
     * Returns the current title substring filter
     * @returns {String} The current title substring filter
     */
    getRunsFilter() {
        return this.runFilterValues;
    }

    /**
     * Add a run to the filter
     * @param {string} runs The runs to be added to the filter criteria
     * @returns {undefined}
     */
    setRunsFilter(runs) {
        if (!/^[0-9,]*$/.test(runs)) {
            return;
        } else if (!runs.length) {
            this.runFilterValues = [];
        } else {
            this.runFilterValues = runs.match(/\d+/g).map(Number);
        }
        this._applyFilters();
    }

    /**
     * Returns the current minimum creation datetime
     * @returns {Integer} The current minimum creation datetime
     */
    getCreatedFilterFrom() {
        return this.createdFilterFrom;
    }

    /**
     * Returns the current maximum creation datetime
     * @returns {Integer} The current maximum creation datetime
     */
    getCreatedFilterTo() {
        return this.createdFilterTo;
    }

    /**
     * Set a datetime for the creation datetime filter
     * @param {String} key The filter value to apply the datetime to
     * @param {Object} date The datetime to be applied to the creation datetime filter
     * @param {Boolean} valid Whether the inserted date passes validity check
     * @returns {undefined}
     */
    setCreatedFilter(key, date, valid) {
        if (valid) {
            this[`createdFilter${key}`] = date;
            this._applyFilters();
        }
    }

    /**
     * Sets all data related to the Logs to `NotAsked` and clears pagination settings.
     * @returns {undefined}
     */
    clearLogs() {
        this.logs = RemoteData.NotAsked();
    }

    /**
     * Returns whether the filter should be shown or not
     * @returns {Boolean} returns whether the filter should be shown
     */
    get areFiltersVisible() {
        return this.showFilters || false;
    }

    /**
     * Sets whether the filters are shown or not
     * @param {Boolean} showFilters Whether the filter should be shown
     * @returns {Boolean} returns boolean
     */
    setShowFilters(showFilters) {
        this.showFilters = showFilters;
        this.notify();
    }

    /**
     * Toggles whether the filters are shown
     * @returns {void}
     */
    toggleFiltersVisibility() {
        this.setShowFilters(!this.areFiltersVisible);
        this.notify();
    }

    /**
     * Return the model handling the filtering on tags
     *
     * @return {TagFilterModel} the filtering model
     */
    get listingTagsFilterModel() {
        return this._listingTagsFilterModel;
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
     * Returns the filter model for author filter
     *
     * @return {FilterInputModel} the filter model
     */
    get authorFilter() {
        return this._authorFilter;
    }

    /**
     * Returns the filter model for title filter
     *
     * @return {FilterInputModel} the filter model
     */
    get titleFilter() {
        return this._titleFilter;
    }

    /**
     * Return the log creation model
     *
     * @return {LogCreationModel} the model
     */
    get creationModel() {
        return this._creationModel;
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
        this._pagination.currentPage = 1;
        now ? this.fetchAllLogs(true) : this._debouncedFetchAllLogs(true);
    }

    /**
     * Register a new filter model
     * @param {FilterInputModel} filter the filter to register
     * @return {void}
     * @private
     */
    _registerFilter(filter) {
        filter.visualChange$.bubbleTo(this);
        filter.observe(() => this._applyFilters());
    }

    /**
     * Returns the list of URL params corresponding to the currently applied filter
     *
     * @return {Object} the URL params
     *
     * @private
     */
    _getFilterQueryParams() {
        const sortOn = this._overviewSortModel.appliedOn;
        const sortDirection = this._overviewSortModel.appliedDirection;

        return {
            ...!this._titleFilter.isEmpty && {
                'filter[title]': this._titleFilter.value,
            },
            ...!this._authorFilter.isEmpty && {
                'filter[author]': this._authorFilter.value,
            },
            ...this.createdFilterFrom && {
                'filter[created][from]':
                    new Date(`${this.createdFilterFrom.replace(/\//g, '-')}T00:00:00.000`).getTime(),
            },
            ...this.createdFilterTo && {
                'filter[created][to]':
                    new Date(`${this.createdFilterTo.replace(/\//g, '-')}T23:59:59.999`).getTime(),
            },
            ...!this.listingTagsFilterModel.isEmpty() && {
                'filter[tags][values]': this.listingTagsFilterModel.selected.join(),
                'filter[tags][operation]': this.listingTagsFilterModel.combinationOperator,
            },
            ...this.runFilterValues.length > 0 && {
                'filter[run][values]': this.runFilterValues.join(),
                'filter[run][operation]': this.runFilterOperation.toLowerCase(),
            },
            ...sortOn && sortDirection && {
                [`sort[${sortOn}]`]: sortDirection,
            },
        };
    }
}
