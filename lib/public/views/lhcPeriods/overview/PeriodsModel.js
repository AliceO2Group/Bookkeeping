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
import { PaginationModel } from '../../components/table/pagination/PaginationModel.js';
import { getRemoteDataSlice } from '../../utils/fetch/getRemoteDataSlice.js';
import { PaginationModel } from '../../../components/Pagination/PaginationModel.js';
import { createCSVExport, createJSONExport } from '../../utils/dataExport/export.js';
import { exportFormats } from './dataExport.js';
import { periodsActiveColumns } from '../ActiveColumns/periodsActiveColumns.js';
import FilterModel from '../../model/filtering/FilterModel.js';

/**
 * Model representing handlers for periods page
 *
 * @implements {OverviewModel}
 */
export default class PeriodsModel extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Model} model Pass the model to access the defined functions
     * @returns {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this.model = model;

        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchLhcPeriods());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this._lhcPeriods = RemoteData.NotAsked();

        // this._isFilterPanelVisible = false;
        // this._shouldHideSelectedPeriods = false;
        // this._sortingRowVisible = false;

        // this._filtering = new FilterModel();
        // this._filtering.observe(() => {
            // this.fetchCurrentPageData();
            // this.notify();
        // });

        // this._currentPagePeriods = RemoteData.notAsked();
        // this._allPeriods = RemoteData.notAsked();

    }


    /**
     * Fetch all the relevant periods from the API
     * @param {Object} filterObject object that defines requested filtering
     * @return {Promise<void>} void
     */
    async fetchLhcPeriods() {
        /**
         * @type {Period[]}
         */

        // const { filterPhrase } = this._filtering;
        const keepExisting = this._pagination.currentPage > 1 && this._pagination.isInfiniteScrollEnabled;

        if (!this._pagination.isInfiniteScrollEnabled) {
            this._lhcFills = RemoteData.loading();
            this.notify();
        }

        this._lhcPeriods = RemoteData.loading();
        this.notify();

        const params = {
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
        };

        const endpoint = `/api/periods?${[new URLSearchParams(params).toString()].join('&')}`;

        try {
            const { items, totalCount } = await getRemoteDataSlice(endpoint);
            const concatenateWith = keepExisting ? this._lhcFills.payload || [] : [];
            this._lhcPeriods = RemoteData.success([...concatenateWith, ...items]);
            this._pagination.itemsCount = totalCount;
        } catch (errors) {
            this._lhcPeriods = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Remote data representing all the relevant lhc periods fetched from the API
     *
     * @returns {RemoteData[]} the remote data of LHC periods
     */
    get lhcPeriods() {
        return this._lhcPeriods;
    }
}
