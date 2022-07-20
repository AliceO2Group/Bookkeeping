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
import { PaginationModel } from '../../../components/Pagination/PaginationModel.js';
import { addStatisticsToLhcFill } from '../../../services/lhcFill/addStatisticsToLhcFill.js';

/**
 * Model for the LHC fills overview page
 */
export class LhcFillsOverviewModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchAllLhcFills());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this._lhcFills = RemoteData.NotAsked();
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._lhcFills = RemoteData.NotAsked();
        this._pagination.reset();
    }

    /**
     * Fetch all the relevant LHC fills from the API
     *
     * @return {Promise<void>} void
     */
    async fetchAllLhcFills() {
        const savedValues = this._lhcFills;
        this._lhcFills = RemoteData.loading();
        this.notify();
        const params = {
            'page[offset]': savedValues.payload && this._pagination.isInfiniteScrollEnabled
                ? savedValues.payload.length
                : (this._pagination.currentPage - 1) * this._pagination.itemsPerPage,
            'page[limit]': this._pagination.isInfiniteScrollEnabled
                ? this.model.INFINITE_SCROLL_CHUNK_SIZE
                : this._pagination.itemsPerPage,
        };

        const endpoint = `/api/lhcFills?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            // Add statistics to runs
            result.data.forEach((lhcFill) => {
                addStatisticsToLhcFill(lhcFill);
            });

            if (this._pagination.isInfiniteScrollEnabled) {
                const payload = this._lhcFills && savedValues.payload ? [...savedValues.payload, ...result.data] : result.data;
                this._lhcFills = RemoteData.success(payload);
            } else {
                this._lhcFills = RemoteData.success(result.data);
            }

            this._pagination.pagesCount = result.meta.page.pageCount;
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
     * Shows the current value of the infinite scroll state.
     *
     * @returns {boolean} If infinite scroll is enabled
     *
     * @deprecated use pagination directly
     */
    isInfiniteScrollEnabled() {
        return this.pagination.isInfiniteScrollEnabled;
    }

    /**
     * Shows the current value of the infinite scroll state.
     *
     * @returns {boolean} If infinite scroll is enabled
     *
     * @deprecated use pagination directly
     */
    get infiniteScrollEnabled() {
        return this.pagination.isInfiniteScrollEnabled;
    }

    /**
     * Getter selected page
     *
     * @returns {number} Selected page
     *
     * @deprecated use pagination directly
     */
    getTotalPages() {
        return this.pagination.pagesCount;
    }

    /**
     * Setter for custom per page amount
     *
     * @param {number} amount Custom amount
     *
     * @returns {undefined}
     *
     * @deprecated use pagination directly
     */
    setCustomPerPage(amount) {
        this.pagination.customItemsPerPage = amount;
    }

    /**
     * Getter for custom per page.
     *
     * @returns {number} custom per page amount.
     *
     * @deprecated use pagination directly
     */
    get customPerPage() {
        return this.pagination.customItemsPerPage;
    }

    /**
     * Getter for selected page
     *
     * @returns {number} selected page number.
     *
     * @deprecated use pagination directly
     */
    getSelectedPage() {
        return this.pagination.currentPage;
    }

    /**
     * Remote data representing all the relevant fills fetched from the API
     *
     * @returns {RemoteData[]} the remote data of LHC fills
     */
    get lhcFills() {
        return this._lhcFills;
    }

    /**
     * Returns the overview pagination
     *
     * @return {PaginationModel} the pagination
     */
    get pagination() {
        return this._pagination;
    }
}
