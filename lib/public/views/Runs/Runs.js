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

import { Observable, RemoteData, fetchClient } from '/js/src/index.js';
import { removeElement } from '../../utilities/removeElement.js';

/**
 * Model representing handlers for homePage.js
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

        this.clearRuns();

        this.title = '';
        this.text = '';

        this.isPreviewActive = false;
        this.editors = [];

        this.collapsableColumns = [];
        this.collapsedColumns = [];
    }

    /**
     * Retrieve every relevant run from the API
     * @param {Number} offset Pagination offset to include when making the API call
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchAllRuns(offset = 0) {
        if (!this.model.tags.getTags().isSuccess()) {
            this.runs = RemoteData.loading();
            this.notify();
        }

        const params = {
            'page[offset]': offset,
            'page[limit]': this.runsPerPage,
            ...this.tagFilterValues.length > 0 && {
                'filter[tag][values]': this.tagFilterValues.join(),
                'filter[tag][operation]': this.tagFilterOperation.toLowerCase(),
            },
        };

        const endpoint = `/api/runs?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.runs = RemoteData.success(result.data);
            this.totalPages = result.meta.page.pageCount;
        } else {
            this.runs = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }

        if (this.model.tags.getTags().isNotAsked()) {
            await this.model.tags.fetchAllTags();
        }

        this.notify();
    }

    /**
     * Retrieve a specified run from the API
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchOneRun(id) {
        this.runs = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/runs/${id}/tree`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.runs = RemoteData.success([result.data]);
        } else {
            this.runs = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }
        this.notify();
    }

    /**
     * Set the text paramter in the model
     * @param {String} text Received string from the view
     * @returns {undefined}
     */
    setText(text) {
        this.text = text;
        this.notify();
    }

    /**
     * Getter for all the data
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
     * Sets all data related to the Runs to `NotAsked`.
     * @returns {undefined}
     */
    clearRuns() {
        this.runs = RemoteData.NotAsked();
        this.collapsedColumns = [];

        this.expandedFilters = [];
        this.tagFilterValues = [];
        this.tagFilterOperation = 'AND';
        this.moreTags = false;

        this.amountDropdownVisible = false;
        this.runsPerPage = 10;
        this.selectedPage = 1;
        this.totalPages = 1;
    }
}
