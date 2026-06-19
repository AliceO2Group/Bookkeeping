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
import { OverviewPageModel } from './OverviewModel.js';
import { FilteringModel } from '../components/Filters/common/FilteringModel.js';

/**
 * Base model for a filterable overview page
 *
 * @template T the type of data displayed in the overview page
 */
export class FilterableOverviewPageModel extends OverviewPageModel {
    /**
     * Constructor
     * @param {QueryRouter} router router that controls the application's page navigation
     * @param {string} pageIdentifier string that indicates what page this model represents
     * @param {Object<string, FilterModel>} filters the filters with their label and model
     */
    constructor(router, pageIdentifier, filters) {
        super();
        this._filteringModel = new FilteringModel(router, filters, this._warnings);

        this._filteringModel.pageIdentifier = pageIdentifier;
        this._filteringModel.visualChange$.bubbleTo(this);
        this._filteringModel.observe(() => this._applyFilters());
        this._sortModel.unobserve(this._sortModelCallback);
        this._sortModel.observe(() => this._applyFilters());
        this._debouncedLoad = (_time) => {}; // Abstract, does nothing on purpose
        this._fetchInstantly = true;
    }

    /**
     * Builds a url string from filters and a base string
     *
     * @param {string} base the base string from which the endpoint will be built
     * @return {string}
     */
    buildRootEndpoint(base) {
        return buildUrl(base, { filter: this.getFilterParams() });
    }

    /**
     * Sets the fetchInstantly boolean
     * @param {boolean} bool the value to set
     * @return {void}
     */
    set fetchInstantly(bool) {
        this._fetchInstantly = bool;
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
     * Apply the current filtering and update the remote data list
     *
     * @param {boolean} now if true, filtering will be applied now without debouncing
     *
     * @return {void}
     */
    _applyFilters() {
        this._pagination.silentlySetCurrentPage(1);
        this._fetchInstantly ? this.load() : this._debouncedLoad();
    }

    /**
     * Set underlying FilteringModel's filters from the query parameters in the URL
     *
     * @param {boolean} notify if the FilteringModel should notify it's observers after finishing setting the filters
     */
    setFilterFromURL(notify) {
        this._filteringModel.setFilterFromURL(notify);
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
     * Return filter params of base model
     *
     * @return {object} filter
     */
    getFilterParams() {
        return this._filteringModel.normalized;
    }
}
