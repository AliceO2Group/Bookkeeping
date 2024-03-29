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
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { SortModel } from '../../../components/common/table/SortModel.js';
import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';

/**
 * Data Passes Per LHC Period overview model
 */
export class DataPassesPerLhcPeriodOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._overviewSortModel = new SortModel();
        this._overviewSortModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });
        this._overviewSortModel.visualChange$.bubbleTo(this);

        this._namesFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._namesFilterModel);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load({ lhcPeriodId } = {}) {
        this._lhcPeriodId = lhcPeriodId ?? this._lhcPeriodId;
        super.load();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {
            filter: {
                lhcPeriodIds: [this._lhcPeriodId],
                names: this._namesFilterModel.normalized,
            },
        };

        const { appliedOn: sortOn, appliedDirection: sortDirection } = this._overviewSortModel;
        if (sortOn && sortDirection) {
            params[`sort[${sortOn}]`] = sortDirection;
        }

        return buildUrl('/api/dataPasses', params);
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._namesFilterModel.reset();
        super.reset();
    }

    /**
     * Get id of current lhc period which data passes are fetched
     */
    get lhcPeriodId() {
        return this._lhcPeriodId;
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
            this.load();
        });
    }

    /**
     * States whether any filter is active
     * @return {boolean} true if any filter is active
     */
    isAnyFilterActive() {
        return !this._namesFilterModel.isEmpty();
    }
}
