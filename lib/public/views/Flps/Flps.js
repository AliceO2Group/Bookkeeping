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
import { INFINITE_SCROLL_CHUNK_SIZE, PaginationModel } from '../../components/Pagination/PaginationModel.js';

/**
 * Model representing handlers for homePage.js
 *
 * @implements {OverviewModel}
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

        // Sub-models
        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchAllFlps());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this.clearFlp();
        this.clearFlps();
    }

    /**
     * Retrieve every relevant flp from the API
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchAllFlps() {
        if (!this._pagination.isInfiniteScrollEnabled) {
            this.flps = RemoteData.loading();
            this.notify();
        }

        const params = {
            'page[offset]': this.flps.payload && this._pagination.isInfiniteScrollEnabled
                ? this.flps.payload.length
                : (this._pagination.currentPage - 1) * this._pagination.itemsPerPage,
            'page[limit]': this._pagination.isInfiniteScrollEnabled ? INFINITE_SCROLL_CHUNK_SIZE : this._pagination.itemsPerPage,
        };

        const endpoint = `/api/flps?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            if (this._pagination.isInfiniteScrollEnabled) {
                const payload = this.flps && this.flps.payload ? [...this.flps.payload, ...result.data] : result.data;
                this.flps = RemoteData.success(payload);
            } else {
                this.flps = RemoteData.success(result.data);
            }

            this._pagination.pagesCount = result.meta.page.pageCount;
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
     * Getter for a singular flp data
     * @returns {RemoteData} Returns a flp
     */
    getFlp() {
        return this.flp;
    }

    /**
     * Getter for all the flp data
     * @returns {RemoteData} Returns all of the filtered flps
     */
    getFlps() {
        return this.flps;
    }

    /**
     * Sets all data related to a flp to their defaults.
     * @returns {undefined}
     */
    clearFlp() {
        this.flp = RemoteData.NotAsked();
    }

    /**
     * Sets all data related to the flps to their defaults.
     * @returns {undefined}
     */
    clearFlps() {
        this.flps = RemoteData.NotAsked();
        this._pagination.reset();
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @returns {Boolean} If any filter is active
     */
    isAnyFilterActive() {
        return false;
    }

    /**
     * Returns the pagination model
     *
     * @return {PaginationModel} the pagination model
     */
    get pagination() {
        return this._pagination;
    }
}
