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

/**
 * @typedef FilteringItem
 * @property {FilterModel} model the model of the filter
 * @property {string} label the label of the filter
 */

/**
 * Model representing a filtering system, including filter inputs visibility, filters values and so on
 */
export class FilteringModel extends Observable {
    /**
     * Constructor
     *
     * @param {Object<string, FilteringItem>} filters the filters with their label and model
     */
    constructor(filters) {
        super();

        this._visualChange$ = new Observable();

        for (const { model } of filters) {
            model.bubbleTo(this);
            model.visualChange$?.bubbleTo(this._visualChange$);
        }
        this._filters = filters;
    }

    /**
     * Reset the filters
     *
     * @return {void}
     */
    reset() {
        for (const { model } of this._filters) {
            model.reset();
        }
    }

    /**
     * Returns the normalized value of all the filters, without null values
     *
     * @return {object} the normalized values
     */
    get normalized() {
        const ret = {};
        for (const filterKey in this._filters) {
            const filter = this.getFilter(filterKey);
            if (filter && !filter.isEmpty) {
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
        for (const { model } of this._filters) {
            if (!model.isEmpty) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the object storing all the filters models
     *
     * @param {string} key the key of the model
     * @return {FilterModel} the filters store
     */
    getFilter(key) {
        return this.filters[key];
    }

    /**
     * Returns the list of human-readable names of currently active filters
     *
     * @return {string} the active filters names
     */
    get activeFiltersLabels() {
        const ret = [];
        for (const { model, label } of this._filters) {
            if (!model.isEmpty) {
                ret.push(label);
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
}
