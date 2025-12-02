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
import { StableBeamFilterModel } from '../../../components/Filters/LhcFillsFilter/StableBeamFilterModel.js';
import { RawTextFilterModel } from '../../../components/Filters/common/filters/RawTextFilterModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { addStatisticsToLhcFill } from '../../../services/lhcFill/addStatisticsToLhcFill.js';

const defaultBeamDurationOperator = '=';
const defaultRunDurationOperator = '=';

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
            fillNumbers: new RawTextFilterModel(),
            beamDuration: new RawTextFilterModel(),
            runDuration: new RawTextFilterModel(),
            hasStableBeams: new StableBeamFilterModel(),
        });

        this._beamDurationOperator = defaultBeamDurationOperator;
        this._runDurationOperator = defaultRunDurationOperator;

        this._filteringModel.observe(() => this._applyFilters(true));
        this._filteringModel.visualChange$.bubbleTo(this);

        this.reset(false);

        if (stableBeamsOnly) {
            this._filteringModel.get('hasStableBeams').setStableBeamsOnly(true);
        }
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
        const params = {
            filter: this.filteringModel.normalized,
            ...this._filteringModel.get('beamDuration').isEmpty === false && {
                'filter[beamDurationOperator]': this._beamDurationOperator,
            },
            ...this._filteringModel.get('runDuration').isEmpty === false && {
                'filter[runDurationOperator]': this._runDurationOperator,
            },
        };
        return buildUrl('/api/lhcFills', params);
    }

    /**
     * Setter function for runDurationOperator
     */
    setRunDurationOperator(runDurationOperator) {
        this._runDurationOperator = runDurationOperator;
        this._applyFilters();
        this.notify();
    }

    /**
     * Run duration operator getter
     */
    getRunDurationOperator() {
        return this._runDurationOperator;
    }

    /**
     * Beam duration operator setter
     */
    setBeamDurationOperator(beamDurationOperator) {
        this._beamDurationOperator = beamDurationOperator;
        this._applyFilters();
        this.notify();
    }

    /**
     * Beam duration operator getter
     */
    getBeamDurationOperator() {
        return this._beamDurationOperator;
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
        this._beamDurationOperator = defaultBeamDurationOperator;
        this._runDurationOperator = defaultRunDurationOperator;

        if (fetch) {
            this._applyFilters(true);
        }
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @return {Boolean} If any filter is active
     */
    isAnyFilterActive() {
        return this._filteringModel.isAnyFilterActive()
            || this._beamDurationOperator !== defaultBeamDurationOperator
            || this._runDurationOperator !== defaultRunDurationOperator;
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
