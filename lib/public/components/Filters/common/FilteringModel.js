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

import { expandQueryLikeNestedKey } from '../../../utilities/expandNestedKey.js';
import { buildUrl, Observable } from '/js/src/index.js';

/**
 * Model representing a filtering system, including filter inputs visibility, filters values and so on
 */
export class FilteringModel extends Observable {
    /**
     * Constructor
     *
     * @param {Object<string, FilterModel>} filters the filters with their label and model
     * @param {Router} router The main application router
     */
    constructor(router, filters) {
        super();

        this._pageIdentifiers = [];
        this.router = router;
        this._visualChange$ = new Observable();

        this._filters = filters;
        this._filterModels = Object.values(filters);
        for (const model of this._filterModels) {
            model.observe(() => {
                this.setFilterToURL();
                this.notify();
            });
            model.visualChange$?.bubbleTo(this._visualChange$);
        }
    }

    /**
     * Sets the page identifiers
     *
     * @param {string[]} _pageIdentifiers Strings that identify the pages as shown in the router params.
     *                                    Used to prevent unneeded reads/writes from/to the url
     * @returns {void}
     */
    set pageIdentifiers(identifiers) {
        this._pageIdentifiers = identifiers;
    }

    /**
     * Reset the filters
     *
     * @param {boolean} [notify=false] if true the model notifies its observers
     * @return {void}
     */
    reset(notify = false, clearUrl = false) {
        for (const model of this._filterModels) {
            model.reset();
        }

        if (notify) {
            this.notify();
        }

        if (clearUrl) {
            const { params } = this.router;
            delete params.filter;
            this.router.go(buildUrl('?', params), false, true);
        }
    }

    /**
     * Returns the normalized value of all the filters, without null values
     *
     * @return {object} the normalized values
     */
    get normalized() {
        const normalizedFilters = {};
        for (const [filterKey, filter] of Object.entries(this._filters)) {
            if (filter && !filter.isEmpty) {
                normalizedFilters[filterKey] = filter.normalized;
            }
        }

        return expandQueryLikeNestedKey(normalizedFilters);
    }

    /**
     * When the user updates the displayed Objects, the filters should be placed in the URL as well
     * @returns {undefined}
     */
    setFilterToURL() {
        const { params } = this.router;
        const newParams = { ...params };
        newParams.filter = this.normalized;

        if (this._pageIdentifiers.includes(params.page)) {
            this.router.go(buildUrl('?', newParams), false, true);
        }
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
     * Look for parameters used for filtering in URL and apply them in the layout if it exists
     * @returns {undefined}
     */
    async setFilterFromURL() {
        const { params: { page = '', filter = {} } } = this.router;

        if (!this._pageIdentifiers.includes(page)) {
            return;
        }

        for (const [key, value] of Object.entries(filter)) {
            const filterModel = this._filters[key];

            if (!filterModel) {
                continue;
            }

            filterModel.normalized = value;
        }

        this.notify();
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
     * NOTE that the method has no effect if called more than once for the same key
     *
     * @param {string} key key of a new filter
     * @param {FilterModel} filter the new filter
     */
    put(key, filter) {
        if (key in this._filters) {
            return;
        }

        this._filters[key] = filter;
        this._filterModels.push(filter);
        filter.bubbleTo(this);
        filter.visualChange$?.bubbleTo(this._visualChange$);
    }
}
