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
import RunsModel from '../Runs.js';
import { RemoteData } from '/js/src/index.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';

/**
 * Runs Per Period overview model
 */
export class RunsPeriodPeriodOverviewModel extends RunsModel {
    /**
     * Constructor
     * @param {Model} model Pass the model to access the defined functions
     */
    constructor(model) {
        super(model);
    }

    /**
     * Retrieve every relevant run from the API
     * @param {object} params model params
     * @param {string} [params.lhcPeriodName] lhc period name which runs should be fetched
     * @param {boolean} clear if true, any previous data will be discarded, even in infinite mode
     *
     * @return {undefined} Injects the data object with the response data
     */
    async fetchAllRuns({ lhcPeriodName }, clear = false) {
        this._lhcPeriodName = lhcPeriodName;

        /**
         * @type {Run[]}
         */
        const concatenateWith = !clear && this._pagination.currentPage !== 1 && this._pagination.isInfiniteScrollEnabled
            ? this._currentPageRuns.payload || []
            : [];

        if (!this._pagination.isInfiniteScrollEnabled) {
            this._currentPageRuns = RemoteData.loading();
            this.notify();
        }

        this._currentPageRuns = RemoteData.notAsked();

        const params = {
            ...this._getFilterQueryParams(),
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
            'filter[runQualities]': 'good',
            'filter[definitions]': 'PHYSICS',
            'filter[lhcPeriods]': this._lhcPeriodName,
        };

        const endpoint = `/api/runs?${new URLSearchParams(params).toString()}`;
        try {
            const { items, totalCount } = await getRemoteDataSlice(endpoint);
            this._currentPageRuns = RemoteData.success([...concatenateWith, ...items]);
            this._pagination.itemsCount = totalCount;
        } catch (errors) {
            this._currentPageRuns = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Get current name of lhc period which runs are fetched by model
     */
    get lhcPeriodName() {
        return this._lhcPeriodName;
    }
}
