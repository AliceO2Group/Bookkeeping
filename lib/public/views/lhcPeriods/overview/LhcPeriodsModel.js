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
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';
import { PaginationModel } from '../../../components/Pagination/PaginationModel.js';

/**
 * Model representing handlers for lhc periods page
 *
 * @implements {OverviewModel}
 */
export class LhcPeriodsOverviewModel extends Observable {
    /**
     * The constructor of the Overview model object
     * @returns {Object} Constructs the Overview model
     */
    constructor() {
        super();
        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchLhcPeriods());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this._lhcPeriods = RemoteData.NotAsked();
    }

    /**
     * Fetch all the relevant periods from the API
     * @param {Object} filterObject object that defines requested filtering
     * @return {Promise<void>} void
     */
    async fetchLhcPeriods() {
        const keepExisting = this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled;

        if (!this._pagination.isInfiniteScrollEnabled) {
            this._lhcPeriods = RemoteData.loading();
            this.notify();
        }

        const paramsPhrase = new URLSearchParams({
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
        }).toString();

        const endpoint = `/api/lhcPeriodsStatistics?${[paramsPhrase].join('&')}`;

        try {
            const { items, totalCount } = await getRemoteDataSlice(endpoint);
            const concatenateWith = keepExisting ? this._lhcPeriods.payload || [] : [];
            this._lhcPeriods = RemoteData.success([
                ...concatenateWith,
                ...items.map((lhcPeriodData) => this.flattenPeriodDataObject(lhcPeriodData)),
            ]);

            this._pagination.itemsCount = totalCount;
        } catch (errors) {
            this._lhcPeriods = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Flatten lhc periods with statistics object
     * @param {Object} lhcPeriodData data
     * @return {Object} lhc period
     */
    flattenPeriodDataObject(lhcPeriodData) {
        const { lhcPeriod } = lhcPeriodData;
        delete lhcPeriodData.lhcPeriod;
        return {
            ...lhcPeriod,
            ...lhcPeriodData,
        };
    }

    /**
     * Remote data representing all the relevant lhc periods fetched from the API
     *
     * @returns {RemoteData[]} the remote data of LHC periods
     */
    get lhcPeriods() {
        return this._lhcPeriods;
    }

    /**
     * Returns the overview pagination
     *
     * @return {PaginationModel} the pagination
     */
    get pagination() {
        return this._pagination;
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._lhcPeriods = RemoteData.NotAsked();
        this._pagination.reset();
    }
}
