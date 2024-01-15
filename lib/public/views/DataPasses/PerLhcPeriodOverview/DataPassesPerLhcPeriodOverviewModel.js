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
import { RemoteData, Observable } from '/js/src/index.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';
import { PaginationModel } from '../../../components/Pagination/PaginationModel.js';
import { SortModel } from '../../../components/common/table/SortModel.js';
import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';

/**
 * Data Passes Per LHC Period overview model
 */
export class DataPassesPerLhcPeriodOverviewModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchDataPasses());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this._overviewSortModel = new SortModel();
        this._overviewSortModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.fetchDataPasses();
        });
        this._overviewSortModel.visualChange$.bubbleTo(this);

        this._dataPasses = RemoteData.NotAsked();

        this._namesFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._namesFilterModel);
    }

    /**
     * Fetch data passes associated with LHC Period with given id
     * @param {object} params fetch params
     * @param {string} [params.lhcPeriodId] lhc period id which data passes should be fetched
     * @return {void}
     */
    async fetchDataPasses({ lhcPeriodId } = {}) {
        this._lhcPeriodId = lhcPeriodId || this._lhcPeriodId;
        if (!this._lhcPeriodId) {
            return;
        }

        const params = {
            page: {
                offset: this._pagination.firstItemOffset,
                limit: this._pagination.itemsPerPage,
            },
            filter: {
                lhcPeriodIds: [this._lhcPeriodId],
            },
        };

        // TODO be replace with RemoteDataSource and observable pipes
        const endpoint = buildUrl('/api/dataPasses', params);
        try {
            this._dataPasses = RemoteData.loading();
            const { items, totalCount } = await getRemoteDataSlice(endpoint);
            this._dataPasses = RemoteData.success(items);

            this._pagination.itemsCount = totalCount;
        } catch (errors) {
            this._dataPasses = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._dataPasses = RemoteData.NotAsked();
        this._pagination.reset();
        this._namesFilterModel.reset();
        this.fetchDataPasses();
    }

    /**
     * Get id of current lhc period which data passes are fetched
     */
    get lhcPeriodId() {
        return this._lhcPeriodId;
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
     * Returns data passes names filter model
     * @return {TextTokensFilterModel} data passes names filter model
     */
    get namesFilterModel() {
        return this._namesFilterModel;
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
            this._pagination.silentlySetCurrentPage(1);
            this.fetchDataPasses();
        });
    }

    /**
     * States whether any filter is active
     * @return {boolean} true if any filter is active
     */
    isAnyFilterActive() {
        return !this._namesFilterModel.isEmpty();
    }

    /**
     * Returns fetched data passes
     *
     * @return {RemoteData} the data passes in the current page if all other neccessary data are succesfuly fetched
     */
    get dataPasses() {
        return this._dataPasses;
    }
}
