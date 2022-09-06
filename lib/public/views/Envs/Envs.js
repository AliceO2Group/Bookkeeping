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
 * Model representing handlers for Environments (envs)
 */
export default class EnvModel extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Object} model Pass the model to access the defined functions
     * @returns {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this.model = model;
        this._envsPerPage = 10;
        this.clearEnvs();
        this.resetEnvsParams(false);

        this._createdEnv = RemoteData.NotAsked();
    }

    /**
     * Retreive every relevant environment from the API
     * @returns {undefined} Inject the data object with the response data
     */
    async fetchAllEnvs() {
        if (!this.isInfiniteScrollEnabled()) {
            this._envs = RemoteData.loading();
            this.notify();
        }

        const params = {
            'page[offset]': this._envs.payload && this._envsPerPage === Infinity
                ? this._envs.payload.length
                : (this._selectedPage - 1) * this._envsPerPage,
            'page[limit]': this._envsPerPage === Infinity ? this.model.INFINITE_SCROLL_CHUNK_SIZE : this._envsPerPage,
        };

        const endpoint = `/api/environments?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            if (this.isInfiniteScrollEnabled()) {
                const payload = this._envs && this._envs.payload ? [...this._envs.payload, ...result.data] : result.data;
                this._envs = RemoteData.success(payload);
            } else {
                this._envs = RemoteData.success(result.data);
            }

            this.totalPages = result.meta.page.pageCount;
        } else {
            this._envs = RemoteData.failure(result.errors || [
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
    async fetchOneEnv(id) {
        this._envs = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/envs/${id}`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this._env = RemoteData.success([result.data]);
            this._env = this._env.payload.tags.map(({ id }) => id);
        } else {
            this._env = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }

    /**
     * Clears the chosen environment.
     * @returns {undefined}
     */
    clearEnv() {
        this._env = RemoteData.NotAsked();
        this._envRuns = RemoteData.NotAsked();
    }

    /**
     * Clear all environments variables to their defaults.
     * @returns {undefined}
     */
    clearEnvs() {
        this._envs = RemoteData.NotAsked();
        this._envsPerPage = 10;
        this._infiniteScrollEnabled = true;
    }

    /**
     * Resets all the set parameters to the original values.
     * @param {boolean} fetch if true should a fetch and update
     * @returns {undefined}
     */
    resetEnvsParams(fetch) {
        this._amountDropdownVisible = false;
        this._rowCountFixed = false;
        this._envsPerPage = 10;
        this._selectedPage = 1;
        this._totalPages = 1;
        this._customPerPage = 10;
        if (fetch) {
            this.fetchAllEnvs();
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
            this.fetchAllEnvs();
        }
    }

    /**
     * Getter for envs per page
     * @returns {number} Number of envs per page
     */
    get envsPerPage() {
        return this._envsPerPage;
    }

    /**
     * Getter for all the environment objects in the class.
     * @returns {RemoteData} List of environments
     */
    get envs() {
        return this._envs;
    }

    /**
     * Setter for envs
     * @param {RemoteData} envs list of environment objects
     */
    set envs(envs) {
        this._envs = envs;
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
    toggleEnvsDropdownVisible() {
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
     * Setter for envs per page
     * @param {number} amount Number of envs per page
     */
    set envsPerPage(amount) {
        if (this._envsPerPage !== amount) {
            this._infiniteScrollEnabled = amount === Infinity;
            this._envsPerPage = amount;
            this._selectedPage = 1;
            this.fetchAllEnvs();
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
