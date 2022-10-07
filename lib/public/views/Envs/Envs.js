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
 * Model representing handlers for Environments (envs)
 *
 * @implements {OverviewModel}
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

        // Sub-models
        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchAllEnvs());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this.clearEnvs();
        this.resetEnvsParams(false);
    }

    /**
     * Retreive every relevant environment from the API
     * @returns {undefined} Inject the data object with the response data
     */
    async fetchAllEnvs() {
        if (!this._pagination.isInfiniteScrollEnabled) {
            this._envs = RemoteData.loading();
            this.notify();
        }

        const params = {
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.isInfiniteScrollEnabled ? INFINITE_SCROLL_CHUNK_SIZE : this._pagination.itemsPerPage,
        };

        const endpoint = `/api/environments?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            if (this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled) {
                const payload = this._envs && this._envs.payload ? [...this._envs.payload, ...result.data] : result.data;
                this._envs = RemoteData.success(payload);
            } else {
                this._envs = RemoteData.success(result.data);
            }

            this._pagination.pagesCount = result.meta.page.pageCount;
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
     * Clear all environments variables to their defaults.
     * @returns {undefined}
     */
    clearEnvs() {
        this._envs = RemoteData.NotAsked();
    }

    /**
     * Resets all the set parameters to the original values.
     * @param {boolean} fetch if true should a fetch and update
     * @returns {undefined}
     */
    resetEnvsParams(fetch) {
        this._pagination.reset();
        if (fetch) {
            this.fetchAllEnvs();
        }
        this.notify();
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
     * Returns the pagination model
     *
     * @return {PaginationModel} the pagination model
     */
    get pagination() {
        return this._pagination;
    }
}
