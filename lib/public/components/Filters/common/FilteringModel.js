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

import { Observable } from '/js/src/index.js';
import { ToggleableModel } from '../../common/toggle/TogglableModel.js';

/**
 * Model representing a filtering system, including filter inputs visibility, filters values and so on
 */
export class FilteringModel extends Observable {
    /**
     * Constructor
     *
     * @param {Map<string, FilterModel[]>} filters the filter models indexed by their unique key
     */
    constructor(filters) {
        super();

        this._visualChange$ = new Observable();

        this._toggleModel = new ToggleableModel();
        this._toggleModel.bubbleTo(this._visualChange$);

        /**
         * @type {Map<string, {filter: FilterModel, humanName: (string|undefined)}>}
         * @private
         */
        this._filtersMeta = new Map();
        for (const propertyKey in filters) {
            this._addFilter(propertyKey, filters[propertyKey]);
        }

        this._filtersStore = filters;
    }

    /**
     * Reset the filters
     *
     * @return {void}
     */
    reset() {
        this._filtersMeta.forEach(({ filter }) => filter.reset());
    }

    /**
     * Returns the normalized value of all the filters, without null values
     *
     * @return {Object} the normalized values
     */
    get normalized() {
        const ret = {};
        for (const [filterKey, { filter }] of this._filtersMeta) {
            if (!filter.isEmpty) {
                ret[filterKey] = filter.normalized;
            }
        }
        return ret;
    }

    /**
     * States if there is currently at least one filter active
     *
     * @return {boolean} true if at least one filter is active
     */
    isAnyFilterActive() {
        for (const [, { filter }] of this._filtersMeta) {
            if (!filter.isEmpty) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the list of human-readable names of currently active filters
     *
     * @return {string} the active filters names
     */
    get activeFiltersNames() {
        const ret = [];
        for (const [, { filter, humanName }] of this._filtersMeta) {
            if (!filter.isEmpty) {
                ret.push(humanName);
            }
        }
        return ret.join(', ');
    }

    /**
     * Returns the observable notified any time there is a visual change which has no impact on the actual filtering
     *
     * @return {Observable} the filters visibility observable
     */
    get visualChange$() {
        return this._visualChange$;
    }

    /**
     * Returns the object storing all the filters models
     *
     * @return {Object} the filters store
     */
    get filters() {
        return this._filtersStore;
    }

    /**
     * The visibility state of the filters popup
     *
     * @return {ToggleableModel} the toggle model
     */
    get toggleModel() {
        return this._toggleModel;
    }

    /**
     * Add a filter to the list of registered filters, and bubble filters events (global and visual) to this model
     *
     * @param {string} filterKey the key of the filter, used to normalize filtering request
     * @param {FilterModel} filter the filter model
     * @return {void}
     * @private
     */
    _addFilter(filterKey, filter) {
        this._filtersMeta.set(
            filterKey,
            {
                filter,
                humanName: `${filterKey[0].toUpperCase()}${filterKey.slice(1).replaceAll(/([A-Z])/g, ' $1').toLowerCase()}`,
            },
        );
        filter.bubbleTo(this);
        filter.visualChange$.bubbleTo(this._visualChange$);
    }
}
