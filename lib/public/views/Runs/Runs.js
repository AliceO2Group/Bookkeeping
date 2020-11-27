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

/**
 * Model representing handlers for runs page
 */
export default class Overview extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Object} model Pass the model to access the defined functions
     * @returns {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this.model = model;

        this.clearRun();
        this.clearRuns();
        this.clearAllEditors();
    }

    /**
     * Retrieve every relevant run from the API
     * @param {Number} offset Pagination offset to include when making the API call
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchAllRuns(offset = 0) {
        this.runs = RemoteData.loading();
        this.notify();

        const params = {
            'page[offset]': offset,
            'page[limit]': this.runsPerPage,
        };

        const endpoint = `/api/runs?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.runs = RemoteData.success(result.data);
            this.totalPages = result.meta.page.pageCount;
        } else {
            this.runs = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }

        this.notify();
    }

    /**
     * Retrieve a specified run from the API
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchOneRun(id) {
        if (this.getLogsOfRun().isSuccess()) {
            // We already have this panel
            return;
        }

        if (this.getFlpsOfRun().isSuccess()) {
            // We already have this panel
            return;
        }

        this.run = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/runs/${id}`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.run = RemoteData.success(result.data);
            this.tags = this.run.payload.tags.map(({ id }) => id);
        } else {
            this.run = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }

    /**
     * Retrieve all associated logs for a specified run from the API
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchLogsOfRun(id) {
        if (this.getRun().isSuccess()) {
            // We already have this panel
            return;
        }

        this.logsOfRun = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/runs/${id}/logs`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.logsOfRun = RemoteData.success(result.data);
        } else {
            this.logsOfRun = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }

    /**
     * Retrieve all associated logs for a specified run from the API
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchFlpsOfRun(id) {
        if (this.getRun().isSuccess()) {
            // We already have this panel
            return;
        }

        this.flpsOfRun = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/runs/${id}/flps`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.flpsOfRun = RemoteData.success(result.data);
        } else {
            this.flpsOfRun = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }

    /**
     * Getter for a singular run data
     * @returns {RemoteData} Returns a run
     */
    getRun() {
        return this.run;
    }

    /**
     * Getter for Logs data associated with a singular run
     * @returns {RemoteData} Returns the logs of a run
     */
    getLogsOfRun() {
        return this.logsOfRun;
    }

    /**
     * Getter for Logs data associated with a singular run
     * @returns {RemoteData} Returns the logs of a run
     */
    getFlpsOfRun() {
        return this.flpsOfRun;
    }

    /**
     * Getter for all the run data
     * @returns {RemoteData} Returns all of the filtered runs
     */
    getRuns() {
        return this.runs;
    }

    /**
     * Getter for visible run dropdown
     * @returns {Number} Returns if the dropdown for choosing an amount of runs should be visible
     */
    isAmountDropdownVisible() {
        return this.amountDropdownVisible;
    }

    /**
     * Getter for runs per page
     * @returns {Number} Returns the number of runs to show on a single page
     */
    getRunsPerPage() {
        return this.runsPerPage;
    }

    /**
     * Getter for the currently selected page
     * @returns {Number} The currently selected page
     */
    getSelectedPage() {
        return this.selectedPage;
    }

    /**
     * Returns all filtering, sorting and pagination settings to their default values
     * @param {Boolean} fetch Whether to refetch all logs after filters have been reset
     * @return {undefined}
     */
    resetLogsParams(fetch = true) {
        this.expandedFilters = [];

        this.sortingColumn = '';
        this.sortingOperation = '';
        this.sortingPreviewColumn = '';
        this.sortingPreviewOperation = '';

        this.amountDropdownVisible = false;
        this.logsPerPage = 10;
        this.selectedPage = 1;
        this.totalPages = 1;

        if (fetch) {
            this.fetchAllLogs();
        }
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @returns {Boolean} If any filter is active
     */
    isAnyFilterActive() {
        return false;
    }

    /**
     * Toggle the expansion state (visibility) of a filter menu
     * @param {String} targetKey The key of the filter whose visibility should be toggled
     * @returns {undefined}
     */
    toggleFilterExpanded(targetKey) {
        if (this.isFilterExpanded(targetKey)) {
            this.expandedFilters = this.expandedFilters.filter((key) => key !== targetKey);
        } else {
            this.expandedFilters.push(targetKey);
        }
        this.notify();
    }

    /**
     * Check if a certain filter should be expanded (visible)
     * @param {String} targetKey The key of the filter whose visibility should be checked
     * @returns {Boolean} Whether the provided filter is expanded or not
     */
    isFilterExpanded(targetKey) {
        return this.expandedFilters.includes(targetKey);
    }

    /**
     * Getter for total pages
     * @returns {Number} Returns the total amount of pages available for the page selector
     */
    getTotalPages() {
        return this.totalPages;
    }

    /**
     * Toggles the visibility of the menu within the run amounts dropdown
     * @return {Boolean} The new state of the amounts dropdown
     */
    toggleRunsDropdownVisible() {
        this.amountDropdownVisible = !this.amountDropdownVisible;
        this.notify();
    }

    /**
     * Sets how many runs are visible per a page, in accordance with the page selector
     * @param {Number} amount The amount of runs that should be shown per page
     * @return {Number} The first page of the new runs, totalling the amount set by the user
     */
    setRunsPerPage(amount) {
        if (this.runsPerPage !== amount) {
            this.runsPerPage = amount;
            this.selectedPage = 1;
            this.fetchAllRuns((this.selectedPage - 1) * amount);
        }

        this.amountDropdownVisible = false;
        this.notify();
    }

    /**
     * Saves custom per page value
     * @param {Number} amount The amount of runs that should be shown per page
     * @see perPageAmountInputComponent
     * @return {void}
     */
    setCustomPerPage(amount) {
        this.customPerPage = amount;
    }

    /**
     * Sets the page chosen through the page selector for usage in pagination, and re-fetches data based on this
     * @param {Number} page The chosen page number
     * @return {Number} The chosen page number
     */
    setSelectedPage(page) {
        if (this.selectedPage !== page) {
            this.selectedPage = page;
            this.fetchAllRuns((this.selectedPage - 1) * this.runsPerPage);
            this.notify();
        }
    }

    /**
     * Sets all data related to a run to their defaults.
     * @returns {undefined}
     */
    clearRun() {
        this.run = RemoteData.NotAsked();
        this.logsOfRun = RemoteData.NotAsked();
        this.flpsOfRun = RemoteData.NotAsked();
    }

    /**
     * Sets all data related to the runs to their defaults.
     * @returns {undefined}
     */
    clearRuns() {
        this.runs = RemoteData.NotAsked();
        this.collapsedColumns = [];
        this.collapsableColumns = [];

        this.expandedFilters = [];

        this.amountDropdownVisible = false;
        this.runsPerPage = 10;
        this.selectedPage = 1;
        this.totalPages = 1;

        /**
         * Value saved from perPageAmountInputComponent
         * @see perPageAmountInputComponent
         * @type {number}
         */
        this.customPerPage = 10;
    }

    /**
     * Clear all editors in the model
     * @returns {void}
     */
    clearAllEditors() {
        this.tags = [];
        this.tagsChanged = false;
    }

    /**
     * Updates the selected tag ID array according to the HTML attributes of the options
     * @param {HTMLCollection} selectedOptions The currently selected tags by the user, according to HTML specification
     * @returns {void}
     */
    setSelectedTags(selectedOptions) {
        const selectedTagsIds = Array.from(selectedOptions)
            .map(({ value }) => parseInt(value, 10))
            .sort((a, b) => a - b);
        if (!selectedTagsIds.every((value, i) => value === this.tags[i])) {
            this.tags = selectedTagsIds;
            this.tagsChanged = true;
            this.notify();
        }
    }

    /**
     * Get the tag values of the current run being edited
     * @returns {Array} the tag objects of the current run being edited
     */
    getSelectedTags() {
        return this.tags;
    }

    /**
     * Get the current state of tags: if they were changed by user or not
     * @return {boolean} if tags were changed by user or not
     */
    selectedTagsChanged() {
        return this.tagsChanged;
    }

    /**
     * Update run tags
     * @return {void}
     */
    async updateRunTags() {
        const { runNumber } = this.run.payload;
        const tags = this.getSelectedTags();

        this.run = RemoteData.loading();
        this.notify();

        const options = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tags,
            }),
        };
        const response = await fetchClient(`/api/runs/${runNumber}`, options);
        const result = await response.json();

        if (result.data) {
            this.run = RemoteData.success(result.data);
        } else {
            RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.clearAllEditors();
        this.notify();
    }
}
