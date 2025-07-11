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

        this._stableBeamsOnly = stableBeamsOnly;
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
            'filter[hasStableBeams]': this._stableBeamsOnly,
        };
    }

    /**
     * Sets the stable beams filter
     *
     * @param {boolean} stableBeamsOnly the new stable beams filter value
     * @return {void}
     */
    setStableBeamsFilter(stableBeamsOnly) {
        this._stableBeamsOnly = stableBeamsOnly;
        this._applyFilters();
        this.notify();
    }

    /**
     * Checks if the stable beams filter is set
     *
     * @return {boolean} true if the stable beams filter is active
     */
    isStableBeamsOnly() {
        return this._stableBeamsOnly;
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
