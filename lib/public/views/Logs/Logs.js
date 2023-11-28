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
import { TagFilterModel } from '../../components/Filters/common/TagFilterModel.js';
import { SortModel } from '../../components/common/table/SortModel.js';
import { debounce } from '../../utilities/debounce.js';
import { FilterInputModel } from '../../components/Filters/common/filters/FilterInputModel.js';
import { LogCreationModel } from './Create/LogCreationModel.js';
import { PaginationModel } from '../../components/Pagination/PaginationModel.js';
import { getRemoteDataSlice } from '../../utilities/fetch/getRemoteDataSlice.js';
import { LogTreeViewModel } from './Details/LogTreeViewModel.js';

/**
 * Model representing handlers for log entries page
 *
 * @implements {OverviewModel}
 */
export default class LogModel extends Observable {
    /**
     * The constructor of the Overview model object
     *
     * @param {Model} model Pass the model to access the defined functions
     */
    constructor(model) {
        super();
        this.model = model;

        // Sub-models
        this._listingTagsFilterModel = new TagFilterModel();
        this._listingTagsFilterModel.observe(() => this._applyFilters());
        this._listingTagsFilterModel.visualChange$.bubbleTo(this);

        this._creationModel = null;

        this._treeViewModel = new LogTreeViewModel();
        this._treeViewModel.bubbleTo(this);

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

        this._contentFilter = new FilterInputModel();
        this._registerFilter(this._contentFilter);

        this._logs = RemoteData.NotAsked();

        this.reset(false);

        // eslint-disable-next-line no-return-assign,require-jsdoc
        const updateDebounceTime = () => this._debouncedFetchAllLogs = debounce(this.fetchAllLogs.bind(this), model.inputDebounceTime);
        model.appConfiguration$.observe(() => updateDebounceTime());
        updateDebounceTime();
    }

    /**
     * Parse the current route parameters to load the log creation model
     *
     * @param {object} queryParams the current query parameters
     * @param {string} [queryParams.parentLogId] the id of log that should be the parent of the log being created
     * @param {string|string[]} [queryParams.runNumbers] the run numbers to link to the log being created
     * @param {string|string[]} [queryParams.lhcFillNumbers] the lhc fill numbers to link to the log being created
     * @param {string|string[]} [queryParams.environmentIds] the environment ids to link to the log being created
     * @return {void}
     */
    loadCreation(queryParams) {
        const parentLogId = parseInt(queryParams.parentLogId, 10);
        let { runNumbers, lhcFillNumbers, environmentIds } = queryParams;

        if (!Array.isArray(runNumbers)) {
            runNumbers = runNumbers !== undefined ? [runNumbers] : [];
        }

        if (!Array.isArray(lhcFillNumbers)) {
            lhcFillNumbers = lhcFillNumbers !== undefined ? [lhcFillNumbers] : [];
        }

        if (!Array.isArray(environmentIds)) {
            environmentIds = environmentIds !== undefined ? [environmentIds] : [];
        }

        this._creationModel = new LogCreationModel(
            (logId) => this.model.router.go(`/?page=log-detail&id=${logId}`),
            parentLogId,
            { runNumbers, lhcFillNumbers, environmentIds },
        );
        this._creationModel.bubbleTo(this);
    }

    /**
     * Load the view of the tree of the given log
     *
     * @param {number} selectedLogId the id of the log for which tree must be displayed
     * @return {void}
     */
    loadTreeView(selectedLogId) {
        this._treeViewModel.selectedLogId = selectedLogId;
    }

    /**
     * Retrieve every relevant log from the API
     *
     * @param {boolean} clear if true, any previous data will be discarded, even in infinite mode
     *
     * @returns {void} Injects the data object with the response data
     */
    async fetchAllLogs(clear = false) {
        const concatenateWith = !clear && this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled
            ? this._logs.payload || []
            : [];

        if (!this._pagination.isInfiniteScrollEnabled) {
            this._logs = RemoteData.loading();
            this.notify();
        }

        const params = {
            ...this._getFilterQueryParams(),
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
        };

        const endpoint = `/api/logs?${new URLSearchParams(params).toString()}`;

        try {
            const { items, totalCount } = await getRemoteDataSlice(endpoint);
            this._logs = RemoteData.success([...concatenateWith, ...items]);
            this._pagination.itemsCount = totalCount;
        } catch (errors) {
            this._logs = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Getter for all the data
     * @returns {RemoteData} Returns all of the filtered logs
     */
    getLogs() {
        return this._logs;
    }

    /**
     * Reset all filtering, sorting and pagination settings to their default values
     *
     * @param {boolean} fetch Whether to refetch all logs after filters have been reset
     * @return {undefined}
     */
    reset(fetch = true) {
        this.titleFilter.reset();
        this.contentFilter.reset();
        this.authorFilter.reset();

        this.createdFilterFrom = '';
        this.createdFilterTo = '';

        this.listingTagsFilterModel.reset();

        this.runFilterOperation = 'AND';
        this.runFilterValues = [];
        this._runFilterRawValue = '';

        this.environmentFilterOperation = 'AND';
        this.environmentFilterValues = [];
        this._environmentFilterRawValue = '';

        this.lhcFillFilterOperation = 'AND';
        this.lhcFillFilterValues = [];
        this._lhcFillFilterRawValue = '';

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
        return (
            !this._titleFilter.isEmpty
            || !this._contentFilter.isEmpty
            || !this._authorFilter.isEmpty
            || this.createdFilterFrom !== ''
            || this.createdFilterTo !== ''
            || !this.listingTagsFilterModel.isEmpty()
            || this.runFilterValues.length !== 0
            || this.environmentFilterValues.length !== 0
            || this.lhcFillFilterValues.length !== 0
        );
    }

    /**
     * Returns the current title substring filter
     * @returns {string} The current title substring filter
     */
    getRunsFilterRaw() {
        return this._runFilterRawValue;
    }

    /**
     * Add a run to the filter
     * @param {string} rawRuns The runs to be added to the filter criteria
     * @returns {undefined}
     */
    setRunsFilter(rawRuns) {
        this._runFilterRawValue = rawRuns;
        const runs = [];
        const valuesRegex = /([0-9]+),?/g;

        let match = valuesRegex.exec(rawRuns);
        // eslint-disable-next-line no-cond-assign
        while (match) {
            runs.push(parseInt(match[1], 10));
            match = valuesRegex.exec(rawRuns);
        }

        // Allow empty runs only if raw runs is an empty string
        if (runs.length > 0 || rawRuns.length === 0) {
            this.runFilterValues = runs;
            this._applyFilters();
        }
    }

    /**
     * Returns the raw current environment filter
     * @returns {string} the raw current environment filter
     */
    getEnvFilterRaw() {
        return this._environmentFilterRawValue;
    }

    /**
     * Returns the current environment filter
     * @returns {string[]} The current environment filter
     */
    getEnvFilter() {
        return this.environmentFilterValues;
    }

    /**
     * Sets the environment filter
     * @param {string} rawEnvironments The environments to apply to the filter
     * @returns {undefined}
     */
    setEnvFilter(rawEnvironments) {
        this._environmentFilterRawValue = rawEnvironments;
        const envs = rawEnvironments
            .split(',')
            .map((id) => id.trim());

        if (envs.length > 0 || rawEnvironments.length === 0) {
            this.environmentFilterValues = envs;
            this._applyFilters();
        }
    }

    /**
     * Returns the current title substring filter
     * @returns {string} The current title substring filter
     */
    getLhcFillsFilterRaw() {
        return this._lhcFillFilterRawValue;
    }

    /**
     * Add a lhcFill to the filter
     * @param {string} rawLhcFills The LHC fills to be added to the filter criteria
     * @returns {void}
     */
    setLhcFillsFilter(rawLhcFills) {
        this._lhcFillFilterRawValue = rawLhcFills;

        // Split the lhc fills string by comma or whitespace, remove falsy values like empty strings, and convert to int
        const lhcFills = rawLhcFills
            .split(/[ ,]+/)
            .filter(Boolean)
            .map((fillNumberStr) => parseInt(fillNumberStr.trim(), 10));

        // Allow empty lhcFills only if raw lhcFills is an empty string
        if (lhcFills.length > 0 || rawLhcFills.length === 0) {
            this.lhcFillFilterValues = lhcFills;
            this._applyFilters();
        }
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
     * @param {string} key The filter value to apply the datetime to
     * @param {Object} date The datetime to be applied to the creation datetime filter
     * @param {boolean} valid Whether the inserted date passes validity check
     * @returns {undefined}
     */
    setCreatedFilter(key, date, valid) {
        if (valid) {
            this[`createdFilter${key}`] = date;
            this._applyFilters();
        }
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
     * Returns the model for body filter
     * @return {FilterInputModel} the filter model
     */
    get contentFilter() {
        return this._contentFilter;
    }

    /**
     * Return the log creation model
     *
     * @return {LogCreationModel|null} the model
     */
    get creationModel() {
        return this._creationModel;
    }

    /**
     * Returns the tree view model
     *
     * @return {LogTreeViewModel} the model
     */
    get treeViewModel() {
        return this._treeViewModel;
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
            ...!this._contentFilter.isEmpty && {
                'filter[content]': this._contentFilter.value,
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
            ...this.environmentFilterValues.length > 0 && {
                'filter[environments][values]': this.environmentFilterValues,
                'filter[environments][operation]': this.environmentFilterOperation.toLowerCase(),
            },
            ...this.lhcFillFilterValues.length > 0 && {
                'filter[lhcFills][values]': this.lhcFillFilterValues.join(),
                'filter[lhcFills][operation]': this.lhcFillFilterOperation.toLowerCase(),
            },
            ...sortOn && sortDirection && {
                [`sort[${sortOn}]`]: sortDirection,
            },
        };
    }
}
