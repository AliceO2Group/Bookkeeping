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
import { SortModel } from '../../../components/common/table/SortModel.js';
import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';

/**
 * LHC Periods overview model
 *
 * @implements {OverviewModel}
 */
export class LhcPeriodsOverviewModel extends Observable {
    /**
     * The constructor of the Overview model object
     */
    constructor() {
        super();
        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchLhcPeriods());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this._overviewSortModel = new SortModel();
        this._overviewSortModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.fetchLhcPeriods();
        });
        this._overviewSortModel.visualChange$.bubbleTo(this);

        this._lhcPeriods = RemoteData.NotAsked();

        this._namesFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._namesFilterModel);
        this._yearsFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._yearsFilterModel);
        this._beamTypesFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._beamTypesFilterModel);
    }

    /**
     * Fetch all the relevant LHC Periods from the API
     * @param {boolean} clear remove fetched data and force to set loading state before fetching once again
     * @returns {void}
     */
    async fetchLhcPeriods(clear = false) {
        const keepExisting = this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled;

        if (clear || !this._pagination.isInfiniteScrollEnabled) {
            this._lhcPeriods = RemoteData.loading();
            this.notify();
        }

        const queryParams = {
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
        };

        const { appliedOn: sortOn, appliedDirection: sortDirection } = this._overviewSortModel;
        if (sortOn && sortDirection) {
            queryParams[`sort[${sortOn}]`] = sortDirection;
        }
        const endpoint = buildUrl('/api/lhcPeriodsStatistics', { ...queryParams, ...this.getFilteringQueryParameters() });

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
     * @returns {Object} lhc period
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
     * @returns {RemoteData} the remote data of LHC periods
     */
    get lhcPeriods() {
        return this._lhcPeriods;
    }

    /**
     * Returns the overview pagination model
     *
     * @return {PaginationModel} the pagination model
     */
    get pagination() {
        return this._pagination;
    }

    /**
     * Returns the model handling the overview page table sort
     *
     * @return {SortModel} the sort model
     */
    get overviewSortModel() {
        return this._overviewSortModel;
    }

    /**
     * Getter to lhc periods names filter model
     * @return {TextTokensFilterModel} lhc periods names filter model
     */
    get namesFilterModel() {
        return this._namesFilterModel;
    }

    /**
     * Getter to lhc periods years filter model
     * @return {TextTokensFilterModel} lhc periods years filter model
     */
    get yearsFilterModel() {
        return this._yearsFilterModel;
    }

    /**
     * Getter to lhc periods beam type filter model
     * @return {TextTokensFilterModel} lhc periods beam type filter model
     */
    get beamTypesFilterModel() {
        return this._beamTypesFilterModel;
    }

    /**
     * Get filter related query params
     * @return {object} filter search query parameters
     */
    getFilteringQueryParameters() {
        return {
            'filter[names]': this._namesFilterModel.normalized,
            'filter[years]': this._yearsFilterModel.normalized,
            'filter[beamTypes]': this._beamTypesFilterModel.normalized,
        };
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._lhcPeriods = RemoteData.NotAsked();
        this._pagination.reset();
        this._namesFilterModel.reset();
        this._yearsFilterModel.reset();
        this.fetchLhcPeriods();
    }

    /**
     * Register a new filter model
     * @param {FilterModel} filterModel the filter model to register
     * @return {void}
     * @private
     */
    _registerFilter(filterModel) {
        filterModel.visualChange$.bubbleTo(this);
        filterModel.observe(() => {
            this.fetchLhcPeriods(true);
        });
    }

    /**
     * States whether any filter is active
     * @return {boolean} true if any filter is active
     */
    isAnyFilterActive() {
        return !this._namesFilterModel.isEmpty() || !this._yearsFilterModel.isEmpty();
    }
}
