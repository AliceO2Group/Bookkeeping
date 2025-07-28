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
 * Model representing a filtering system, including filter inputs visibility, filters values and so on
 */
export class FilteringModel extends Observable {
    /**
     * Constructor
     *
     * @param {Object<string, FilterModel>} filters the filters with their label and model
     */
    constructor(filters) {
        super();

        this._visualChange$ = new Observable();

        this._filters = filters;
        this._filterModels = Object.values(filters);
        for (const model of this._filterModels) {
            model.bubbleTo(this);
            model.visualChange$?.bubbleTo(this._visualChange$);
        }
    }

    /**
     * Reset the filters
     *
     * @return {void}
     */
    reset() {
        for (const model of this._filterModels) {
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
        for (const [filterKey, filter] of Object.entries(this._filters)) {
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
        for (const model of this._filterModels) {
            if (!model.isEmpty) {
                return true;
            }
        }
        return false;
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
     * Return the filter model for a given key
     *
     * @param {string} key the key of the filtering model
     * @return {FilterModel} the filtering model
     */
    get(key) {
        if (!(key in this._filters)) {
            throw new Error(`No filter found with key ${key}`);
        }

        return this._filters[key];
    }

    /**
     * Add new filter
     *
     * @param {string} key key of a new filter
     * @param {FilterModel} filter the new filter
     */
    put(key, filter) {
        if (key in this._filters) {
            throw new Error(`Filter under key ${key} already exists`);
        }

        this._filters[key] = filter;
    }
}
