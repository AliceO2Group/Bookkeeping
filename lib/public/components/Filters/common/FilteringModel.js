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
    * @param {string[]} pageIdentifiers Strings that identify the pages as shown in the router params. Used to prevent unneeded reads/writes from/to the url
    */
   constructor(router, pageIdentifiers, filters) {
        // TODO do someting about the pageIdentifier system. The current way of doing it is terrible
        super();

        this.pageIdentifiers = pageIdentifiers;
        this.router = router;
        this._visualChange$ = new Observable();

        this._filters = filters;
        this._filterModels = Object.values(filters);
        for (const model of this._filterModels) {
            model.observe(() => {
                this.setFilterToURL();
                this.notify()
            });
            model.visualChange$?.bubbleTo(this._visualChange$);
        }
    }

    /**
     * Reset the filters
     *
     * @param {boolean} [notify=false] if true the model notifies its observers
     * @return {void}
     */
    reset(notify = false) {
        for (const model of this._filterModels) {
            model.reset();
        }

        if (notify) {
            this.notify();
        }
    }

    /**
     * Returns the normalized value of all the filters, without null values
     *
     * @return {object} the normalized values
     */
    get normalizedFilter() {
        const normalizedFilters = {};
        for (const [filterKey, filter] of Object.entries(this._filters)) {
            if (filter && !filter.isEmpty) {
                console.log(filterKey, filter.normalizedFilter);
                
                normalizedFilters[filterKey] = filter.normalizedFilter;
            }
        }

        return expandQueryLikeNestedKey(normalizedFilters);
    }

    /**
     * When the user updates the displayed Objects, the filters should be placed in the URL as well
     * @returns {undefined}
     */
    setFilterToURL() {
        const newParams = { page: this.router.params.page, filter: this.normalizedFilter };
        if (!this._equalByStringValues(newParams, this.router.params)) {            
            this.router.go(buildUrl('?', newParams))
        }
        console.log('going from');
        console.log(new Error('mt').stack);
        console.log(this.router.params);
        console.log('to');
        console.log(newParams);
        console.log();
    }

    _equalByStringValues(objA = {}, objB = {}) {
        const normalize = (obj) =>
            Object.keys(obj)
                .sort()
                .map(key => [key, String(obj[key])]);

        const aEntries = normalize(objA);
        const bEntries = normalize(objB);

        if (aEntries.length !== bEntries.length) return false;

        return aEntries.every(
            ([key, value], index) =>
                key === bEntries[index][0] &&
                value === bEntries[index][1]
        );
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
        const { params } = this.router;  

        if (params?.page in this.pageIdentifiers) return;
        
        for (const [key, value] of Object.entries(params).slice(1)) { // Page is always first, and page isn't needed for the loop
            const filterModel = this._filters[key]

            if (!filterModel) continue;
            
            filterModel.filterValue = JSON.parse(value);
            filterModel.notify();
        }

        this.notify();
    }

    /**
     * When the user updates the displayed Objects, the filters should be placed in the URL as well
     * @param {boolean} isSilent - whether the route should be silent or not
     * @returns {undefined}
     */
    setFilterToURL(filterKey, filterValue, isSilent = true) {
        const { params } = this.router;
        
        if (filterValue === undefined || filterValue === null) {
            delete params[filterKey]
        } else {
            params[filterKey] = JSON.stringify(filterValue);
        }
        
        let queryString = '?';
        
        for (const [key, value] of Object.entries(params)) {
            queryString += `${key}=${value}&`;
        }
        
        queryString= queryString.slice(0, -1);

        this.router.go(queryString, true, isSilent);
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
