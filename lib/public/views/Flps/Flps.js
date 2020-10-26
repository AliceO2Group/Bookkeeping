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

        this.clearFlp();
        this.clearFlps();
    }

    /**
     * Retrieve every relevant flp from the API
     * @param {Number} offset Pagination offset to include when making the API call
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchAllFlps(offset = 0) {
        this.flps = RemoteData.loading();
        this.notify();

        const params = {
            'page[offset]': offset,
            'page[limit]': this.flpsPerPage,
        };

        const endpoint = `/api/flps?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.flps = RemoteData.success(result.data);
            this.totalPages = result.meta.page.pageCount;
        } else {
            this.flps = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }

        this.notify();
    }

    /**
     * Retrieve a specified flp from the API
     * @param {Number} id The ID of the flp to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchOneFlp(id) {
        if (this.getLogsOfRun().isSuccess()) {
            // We already have this panel
            return;
        }

        if (this.getFlpsOfRun().isSuccess()) {
            // We already have this panel
            return;
        }

        this.flp = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/flps/${id}`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.flp = RemoteData.success(result.data);
        } else {
            this.flp = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }
        this.notify();
    }

    /**
     * Retrieve all associated logs for a specified flp from the API
     * @param {Number} id The ID of the flp to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchLogsOfFlp(id) {
        if (this.getFlp().isSuccess()) {
            // We already have this panel
            return;
        }

        this.logsOfFlp = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/flps/${id}/logs`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.logsOfFlp = RemoteData.success(result.data);
        } else {
            this.logsOfFlp = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }
        this.notify();
    }

    /**
     * Getter for a singular flp data
     * @returns {RemoteData} Returns a flp
     */
    getFlp() {
        return this.flp;
    }

    /**
     * Getter for Logs data associated with a singular flp
     * @returns {RemoteData} Returns the logs of a flp
     */
    getLogsOfFlp() {
        return this.logsOfFlp;
    }

    /**
     * Getter for all the flp data
     * @returns {RemoteData} Returns all of the filtered flps
     */
    getFlps() {
        return this.flps;
    }

    /**
     * Getter for visible flp dropdown
     * @returns {Number} Returns if the dropdown for choosing an amount of flps should be visible
     */
    isAmountDropdownVisible() {
        return this.amountDropdownVisible;
    }

    /**
     * Getter for flps per page
     * @returns {Number} Returns the number of flps to show on a single page
     */
    getFlpsPerPage() {
        return this.flpsPerPage;
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
     * Toggles the visibility of the menu within the flp amounts dropdown
     * @return {Boolean} The new state of the amounts dropdown
     */
    toggleFlpsDropdownVisible() {
        this.amountDropdownVisible = !this.amountDropdownVisible;
        this.notify();
    }

    /**
     * Sets how many flps are visible per a page, in accordance with the page selector
     * @param {Number} amount The amount of flps that should be shown per page
     * @return {Number} The first page of the new flps, totalling the amount set by the user
     */
    setFlpsPerPage(amount) {
        if (this.flpsPerPage !== amount) {
            this.flpsPerPage = amount;
            this.selectedPage = 1;
            this.fetchAllFlps((this.selectedPage - 1) * amount);
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
            this.fetchAllFlps((this.selectedPage - 1) * this.flpsPerPage);
            this.notify();
        }
    }

    /**
     * Sets all data related to a flp to their defaults.
     * @returns {undefined}
     */
    clearFlp() {
        this.flp = RemoteData.NotAsked();
        this.logsOfFlp = RemoteData.NotAsked();
    }

    /**
     * Sets all data related to the flps to their defaults.
     * @returns {undefined}
     */
    clearFlps() {
        this.flps = RemoteData.NotAsked();
        this.collapsedColumns = [];
        this.collapsableColumns = [];

        this.expandedFilters = [];

        this.amountDropdownVisible = false;
        this.flpsPerPage = 10;
        this.selectedPage = 1;
        this.totalPages = 1;
    }
}
