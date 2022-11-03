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
import { PaginationModel } from '../../../components/Pagination/PaginationModel.js';
import { addStatisticsToLhcFill } from '../../../services/lhcFill/addStatisticsToLhcFill.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';

/**
 * Model for the LHC fills overview page
 *
 * @implements {OverviewModel}
 */
export class LhcFillsOverviewModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        // Sub-models
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
        /**
         * @type {LhcFill[]}
         */
        const concatenateWith = this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled
            ? this._lhcFills.payload || []
            : [];

        if (!this.pagination.isInfiniteScrollEnabled) {
            this._lhcFills = RemoteData.loading();
            this.notify();
        }

        const params = {
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
        };

        const endpoint = `/api/lhcFills?${new URLSearchParams(params).toString()}`;

        try {
            const { items, totalCount } = await getRemoteDataSlice(endpoint);
            this._lhcFills = RemoteData.success([...concatenateWith, ...items]);
            for (const item of items) {
                addStatisticsToLhcFill(item);
            }
            this._pagination.itemsCount = totalCount;
        } catch (errors) {
            this._lhcFills = RemoteData.failure(errors);
        }

        this.notify();
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
