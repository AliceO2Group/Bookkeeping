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

import { buildUrl } from '/js/src/index.js';
import { FilteringModel } from '../../../components/Filters/common/FilteringModel.js';
import { RawTextFilterModel } from '../../../components/Filters/common/filters/RawTextFilterModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { addStatisticsToLhcFill } from '../../../services/lhcFill/addStatisticsToLhcFill.js';
import { BeamTypeFilterModel } from '../../../components/Filters/LhcFillsFilter/BeamTypeFilterModel.js';
import { TextComparisonFilterModel } from '../../../components/Filters/common/filters/TextComparisonFilterModel.js';
import { TimeRangeFilterModel } from '../../../components/Filters/RunsFilter/TimeRangeFilter.js';
import { ToggleFilterModel } from '../../../components/Filters/common/filters/ToggleFilterModel.js';

/**
 * Model for the LHC fills overview page
 *
 * @implements {OverviewModel}
 */
export class LhcFillsOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     *
     * @param {QueryRouter} router router that controls the application's page navigation
     * @param {boolean} [stableBeamsOnly=false] if true, overview will load stable beam only
     * @param {string} pageIdentifier string that indicates what page this model represents
     */
    constructor(router, stableBeamsOnly = false, pageIdentifier) {
        super();

        this._filteringModel = new FilteringModel(
            router,
            {
                fillNumbers: new RawTextFilterModel(),
                beamDuration: new TextComparisonFilterModel(),
                runDuration: new TextComparisonFilterModel(),
                hasStableBeams: new ToggleFilterModel(stableBeamsOnly, true),
                stableBeamsStart: new TimeRangeFilterModel(),
                stableBeamsEnd: new TimeRangeFilterModel(),
                beamTypes: new BeamTypeFilterModel(),
                schemeName: new RawTextFilterModel(),
            },
        );

        this._filteringModel.pageIdentifier = pageIdentifier;
        this._filteringModel.setFilterFromURL();
        this._filteringModel.observe(() => this._applyFilters());
        this._filteringModel.visualChange$.bubbleTo(this);
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
        return buildUrl('/api/lhcFills', { filter: this.filteringModel.normalized });
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
     * @param {boolean} [clearUrl=false] if true filters will be removed from the url
     * @return {void}
     */
    resetFiltering(fetch = true, clearUrl = false) {
        this._filteringModel.reset(false, clearUrl);

        if (fetch) {
            this._applyFilters();
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
