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
import { LhcFillDetailsModel } from './Detail/LhcFillDetailsModel.js';
import { addStatisticsToLhcFill } from '../../services/lhcFill/addStatisticsToLhcFill.js';

/**
 * Model representing handlers for LhcFills (lhcFills)
 */
export default class LhcFills extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Object} model Pass the model to access the defined functions
     * @returns {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this.model = model;

        // Sub-models
        this._detailsModel = new LhcFillDetailsModel();
        this._detailsModel.bubbleTo(this);

        this._lhcFillsPerPage = 10;
        this.clearLhcFills();
        this.resetLhcFillsParams(false);
    }

    /**
     * Load a new LHC fill details model for the given fill id
     *
     * @param {number} lhcFillNumber the number of the fill for which model details must be instantiated
     *
     * @return {void}
     */
    loadDetails(lhcFillNumber) {
        this._detailsModel.lhcFillNumber = lhcFillNumber;
    }

    /**
     * Clear the details model
     *
     * @return {void}
     */
    clearDetails() {
        this._detailsModel.lhcFillNumber = null;
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
            // Add statistics to runs
            result.data.forEach((lhcFill) => {
                addStatisticsToLhcFill(lhcFill);
            });

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

    /**
     * Returns the model for the details page
     *
     * @return {LhcFillDetailsModel} the details model
     */
    get detailsModel() {
        return this._detailsModel;
    }
}
