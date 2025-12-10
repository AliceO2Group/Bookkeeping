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

import { FilteringModel } from '../../../components/Filters/common/FilteringModel.js';
import { StableBeamFilterModel } from '../../../components/Filters/LhcFillsFilter/StableBeamFilterModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { addStatisticsToLhcFill } from '../../../services/lhcFill/addStatisticsToLhcFill.js';

/**
 * Model for the LHC fills overview page
 *
 * @implements {OverviewModel}
 */
export class LhcFillsOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     *
     * @param {boolean} [stableBeamsOnly=false] if true, overview will load stable beam only
     */
    constructor(stableBeamsOnly = false) {
        super();

        this._filteringModel = new FilteringModel({
            hasStableBeams: new StableBeamFilterModel(stableBeamsOnly),
        });

        this._filteringModel.observe(() => this._applyFilters(true));
        this._filteringModel.visualChange$.bubbleTo(this);

        this.reset(false);
    }

    /**
     * @inheritDoc
     */
    processItems(items) {
        for (const item of items) {
            addStatisticsToLhcFill(item);
        }
        return items;
    }

    /**
     * @inheritDoc
     */
    getRootEndpoint() {
        return '/api/lhcFills';
    }

    /**
     * @inheritDoc
     */
    async getLoadParameters() {
        return {
            ...await super.getLoadParameters(),
            ...{ filter: this.filteringModel.normalized },
        };
    }

    /**
     * Returns all filtering, sorting and pagination settings to their default values
     * @param {boolean} [fetch = true] whether to refetch all data after filters have been reset
     * @return {void}
     */
    reset(fetch = true) {
        super.reset();
        this.resetFiltering(fetch);
    }

    /**
     * Reset all filtering models
     * @param {boolean} fetch Whether to refetch all data after filters have been reset
     * @return {void}
     */
    resetFiltering(fetch = true) {
        this._filteringModel.reset();

        if (fetch) {
            this._applyFilters(true);
        }
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @return {Boolean} If any filter is active
     */
    isAnyFilterActive() {
        return this._filteringModel.isAnyFilterActive();
    }

    /**
     * Return the filtering model
     *
     * @return {FilteringModel} the filtering model
     */
    get filteringModel() {
        return this._filteringModel;
    }

    /**
     * Apply the current filtering and update the remote data list
     *
     * @return {void}
     */
    _applyFilters() {
        this._pagination.currentPage = 1;
        this.load();
    }
}
