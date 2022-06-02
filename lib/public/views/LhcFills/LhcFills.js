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
 * Model representing handlers for LhcFills (lhcFills)
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
        this._lhcFillsPerPage = 10;
        this.clearLhcFills();
        this.resetLhcFillsParams(false);

        this._createdLhcFill = RemoteData.NotAsked();
    }

    /**
     * Retreive every relevant lhcFillironment from the API
     * @returns {undefined} Inject the data object with the response data
     */
    async fetchAllLhcFills() {
        const savedValues = this._lhcFills;
        this._lhcFills = RemoteData.loading();
        this.notify();
        const params = {
            'page[offset]': savedValues.payload && this._lhcFillsPerPage === Infinity ?
                savedValues.payload.length : (this._selectedPage - 1) * this._lhcFillsPerPage,
            'page[limit]': this._lhcFillsPerPage === Infinity ? this.model.INFINITE_SCROLL_CHUNK_SIZE : this._lhcFillsPerPage,
        };

        const endpoint = `/api/lhcFills?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            if (this.isInfiniteScrollEnabled()) {
                const payload = this._lhcFills && savedValues.payload ? [...savedValues.payload, ...result.data] : result.data;
                this._lhcFills = RemoteData.success(payload);
            } else {
                this._lhcFills = RemoteData.success(result.data);
            }

            this.totalPages = result.meta.page.pageCount;
        } else {
            this._lhcFills = RemoteData.failure(result.errors || [
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
    async fetchOneLhcFill(id) {
        this._lhcFills = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/lhcFill/${id}`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this._lhcFill = RemoteData.success([result.data]);
            this._lhcFill = this._lhcFill.payload.tags.map(({ id }) => id);
        } else {
            this._lhcFill = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }

    /**
     * Clears the chosen lhcFillironment.
     * @returns {undefined}
     */
    clearLhcFill() {
        this._lhcFill = RemoteData.NotAsked();
        this._lhcFillRuns = RemoteData.NotAsked();
    }

    /**
     * Clear all LhcFills variables to their defaults.
     * @returns {undefined}
     */
    clearLhcFills() {
        this._lhcFills = RemoteData.NotAsked();
        this._lhcFillsPerPage = 10;
        this._infiniteScrollEnabled = true;
    }

    /**
     * Resets all the set parameters to the original values.
     * @param {boolean} fetch if true should a fetch and update
     * @returns {undefined}
     */
    resetLhcFillsParams(fetch) {
        this._amountDropdownVisible = false;
        this._rowCountFixed = false;
        this._lhcFillsPerPage = 10;
        this._selectedPage = 1;
        this._totalPages = 1;
        this._customPerPage = 10;
        if (fetch) {
            this.fetchAllLhcFills();
        }
        this.notify();
    }

    /**
     * Shows the current value of the infinite scroll state.
     * @returns {boolean} If infinite scroll is enabled
     */
    isInfiniteScrollEnabled() {
        return this._infiniteScrollEnabled;
    }

    /**
     * Shows the current value of the infinite scroll state.
     * @returns {boolean} If infinite scroll is enabled
     */
    get infiniteScrollEnabled() {
        return this._infiniteScrollEnabled;
    }

    /**
     * Setter selected page
     * @param {integer} page new value
     */
    set selectedPage(page) {
        if (this._selectedPage !== page) {
            this._selectedPage = page;
            this.notify();
            this.fetchAllLhcFills();
        }
    }

    /**
     * Getter for lhcFills per page
     * @returns {number} Number of lhcFills per page
     */
    get lhcFillsPerPage() {
        return this._lhcFillsPerPage;
    }

    /**
     * Getter for for all the lhcFillironment objects in the class.
     * @returns {Array} Array of lhcFillrionments
     */
    get lhcFills() {
        return this._lhcFills;
    }

    /**
     * Setter for lhcFills
     * @param {Array} lhcFills array of lhcFillironment objects
     */
    set lhcFills(lhcFills) {
        this._lhcFills = lhcFills;
        this.notify();
    }

    /**
     * Returns if the dropdown is visible
     * @returns {boolean} the amount dropdown visible value
     */
    isAmountDropdownVisible() {
        return this._amountDropdownVisible;
    }

    /**
     * Toggles dropdown visibility.
     * @return {undefined}
     */
    toggleLhcFillsDropdownVisible() {
        this._amountDropdownVisible = !this._amountDropdownVisible;
        this.notify();
    }

    /**
     * Setter for row count fixed
     * @param {boolean} value Set the row count to fixed or not
     */
    set rowCountFixed(value) {
        this._rowCountFixed = value;
        this.notify();
    }

    /**
     * Setter for row count fixed
     * Needed to be a function because of restrictions.
     * @param {boolean} value set row count fixed
     * @returns {undefined}
     */
    setRowCountFixed(value) {
        this._rowCountFixed = value;
    }

    /**
     * Getter for row count fixed
     * @returns {boolean} if row count is fixed
     */
    get rowCountFixed() {
        return this._rowCountFixed;
    }

    /**
     * Getter selected page
     * @returns {number} Selected page
     */
    get selectedPage() {
        return this._selectedPage;
    }

    /**
     * Getter selected page
     * @returns {number} Selected page
     */
    getTotalPages() {
        return this._totalPages;
    }

    /**
     * Setter for the amount of pages.
     * @param {number} amount Amount of pages
     */
    set totalPages(amount) {
        this._totalPages = amount;
        this.notify();
    }

    /**
     * Setter for lhcFills per page
     * @param {number} amount Number of lhcFills per page
     */
    set lhcFillsPerPage(amount) {
        if (this._lhcFillsPerPage !== amount) {
            this._infiniteScrollEnabled = amount === Infinity;
            this._lhcFillsPerPage = amount;
            this._selectedPage = 1;
            this.notify();
            this.fetchAllLhcFills();
        }

        this._amountDropdownVisible = false;
    }

    /**
     * Setter for custom per page amount
     * @param {number} amount Custom amount
     * @returns {undefined}
     */
    setCustomPerPage(amount) {
        this._customPerPage = amount;
        this.notify();
    }

    /**
     * Getter for custom per page.
     * @returns {number} custom per page amount.
     */
    get customPerPage() {
        return this._customPerPage;
    }

    /**
     * Getter for selected page
     * @returns {number} selected page number.
     */
    getSelectedPage() {
        return this._selectedPage;
    }
}
