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
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { TimeRangeInputModel } from '../../../components/Filters/common/filters/TimeRangeInputModel.js';
import { SelectionFilterModel } from '../../../components/Filters/common/filters/SelectionFilterModel.js';
import { RawTextFilterModel } from '../../../components/Filters/common/filters/RawTextFilterModel.js';
import { debounce } from '../../../utilities/debounce.js';
import { coloredEnvironmentStatusComponent } from '../ColoredEnvironmentStatusComponent.js';
import { StatusAcronym } from '../../../domain/enums/statusAcronym.mjs';

/**
 * Environment overview page model
 */
export class EnvironmentOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super();

        this._filteringModel = new FilteringModel({
            created: new TimeRangeInputModel(),
            runNumbers: new RawTextFilterModel(),
            statusHistory: new RawTextFilterModel(),
            currentStatus: new SelectionFilterModel({
                availableOptions: Object.keys(StatusAcronym).map((status) => ({
                    value: status,
                    label: coloredEnvironmentStatusComponent(status),
                    rawLabel: status,
                })),
            }),
            ids: new RawTextFilterModel(),
        });

        this._filteringModel.observe(() => this._applyFilters(true));
        this._filteringModel.visualChange$?.bubbleTo(this);

        this.reset(false);
        const updateDebounceTime = () => {
            this._debouncedLoad = debounce(this.load.bind(this), model.inputDebounceTime);
        };

        model.appConfiguration$.observe(() => updateDebounceTime());
        updateDebounceTime();
    }

    /**
     * @inheritDoc
     */
    getRootEndpoint() {
        return buildUrl('/api/environments', { filter: this.filteringModel.normalized });
    }

    /**
     * Returns the current environments list as remote data
     *
     * @return {RemoteData} the environments list
     */
    get environments() {
        return this.items;
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
     * @param {boolean} now if true, filtering will be applied now without debouncing
     *
     * @return {void}
     */
    _applyFilters(now = false) {
        this._pagination.currentPage = 1;
        now ? this.load() : this._debouncedLoad(true);
    }
}
