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
import { SelectionModel } from '../../common/selection/SelectionModel.js';
import { FilterModel } from './FilterModel.js';
import { buildUrl, Observable, parseUrlParameters } from '/js/src/index.js';

const WARNING_TYPES = Object.freeze({
    PAGE_MISMATCH: 'Page-Filter mismatch',
    UNKNOWN_FILTERS: 'Unknown Filters',
    UNPARSABLE_URL: 'Unparseable URL',
    UNPARSABLE_FILTERS: 'Unparsable Filters',
});

/**
 * Model representing a filtering system, including filter inputs visibility, filters values and so on
 */
export class FilteringModel extends Observable {
    /**
     * Constructor
     *
     * @param {QueryRouter} router router that controls the application's page navigation
     * @param {Object<string, FilterModel>} filters the filters with their label and model
     * @param {Map<string, string>} warnings object reference used to define warnings.
     */
    constructor(router, filters, warnings) {
        super();
        this._visualChange$ = new Observable();
        this._pageIdentifier = null;
        this._warnings = warnings;

        this._router = router;
        this._filters = {};
        this._filterModels = [];
        Object.entries(filters).forEach(([key, model]) => this.put(key, model));
    }

    /**
     * Sets the page identifiers
     *
     * @param {string} identifier a string identifies a page from the router params.
     * Used to prevent unneeded reads/writes from/to the url
     * @returns {void}
     */
    set pageIdentifier(identifier) {
        this._pageIdentifier = identifier;
    }

    /**
     * Reset the filters
     *
     * @param {boolean} [notify=false] if true the model notifies its observers
     * @param {boolean} [clearUrl=false] if true filters will be removed from the url
     * @return {void}
     */
    reset(notify = false, clearUrl = false) {
        if (!this.isAnyFilterActive()) {
            return;
        }

        for (const model of this._filterModels) {
            model.reset();
        }

        if (notify) {
            this.notify();
        }

        if (clearUrl) {
            this._clearWarnings();
            const { params } = this._router;
            params.filter = this.normalized;
            this._router.go(buildUrl('?', params), false, true);
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
     * States if there is currently at least one filter active
     *
     * @return {boolean} true if at least one filter is active
     */
    isAnyFilterActive() {
        return !this._filterModels.every((model) => model.isInactive);
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
     * When the user updates the displayed Objects, the filters should be placed in the URL as well
     * @returns {undefined}
     */
    setFilterToURL() {
        const { params } = this._router;
        const newParams = { ...params };
        newParams.filter = this.normalized;

        if (this._pageIdentifier === params.page) {
            this._router.go(buildUrl('?', newParams), false, true);
        }

        this.notify();
    }

    /**
     * Compute seach parameters based a url or router
     *
     * @param {string} url the url that is to be parsed
     * @returns {object} the serach parameters object
     */
    _computeParameters(url) {
        try {
            return parseUrlParameters(new URL(url).searchParams);
        } catch {
            this._warnings.set(WARNING_TYPES.UNPARSABLE_URL, `URL could not be parsed. URL: ${url}`);
            this.notify();
            return {};
        }
    }

    /**
     * Look for parameters used for filtering in URL and apply them in the layout if it exists
     *
     * @param {boolean} notify if observers should be notified after setting the filters
     * @param {string|null} [url=null] the url that is to be parsed into active filters
     * @returns {undefined}
     */
    setFilterFromURL(notify = false, url = null) {
        this._clearWarnings();

        const params = url ? this._computeParameters(url) : this._router.params;
        const { page, filter } = params;

        if (this._pageIdentifier !== page) {
            if (url && page) { // 'page' might be undefined if the url is unparsable
                this._warnings.set(WARNING_TYPES.PAGE_MISMATCH, `The filters you tried applying were meant for ${page}`);
            }
        } else {
            if (!filter) {
                this.reset();
                return;
            }

            const { setFilterErrors, unknownFilters } = this._setFilters(filter);

            if (setFilterErrors.length > 0) {
                this._warnings.set(
                    WARNING_TYPES.UNPARSABLE_FILTERS,
                    `The following filter-value pairs could not be parsed: [${setFilterErrors.join(', ')}]`,
                );
            }

            if (unknownFilters.length > 0) {
                this._warnings.set(
                    WARNING_TYPES.UNKNOWN_FILTERS,
                    `The filters: [${unknownFilters.join(', ')}]; are not reccognised. Check if they are spelled correctly.`,
                );
            }

            if (url) {
                this._router.go(buildUrl('?', params), false, true);
            }
        }

        if (notify) {
            this.notify();
        }
    }

    /**
     * Clear all filter-related warnings from the warnings map
     *
     * @returns {undefined}
     */
    _clearWarnings() {
        this._warnings.delete(WARNING_TYPES.UNPARSABLE_URL);
        this._warnings.delete(WARNING_TYPES.UNPARSABLE_FILTERS);
        this._warnings.delete(WARNING_TYPES.UNKNOWN_FILTERS);
        this._warnings.delete(WARNING_TYPES.PAGE_MISMATCH);
    }

    /**
     * Sets all filters using their normalized setters
     *
     * @param {object<string, object|string} filters an object containing normalized filter values
     * @returns {object<string, string[]>} an object containging the uknown filters and the filters that failed to parse
     */
    _setFilters(filters) {
        const unknownFilters = [];
        const setFilterErrors = [];

        for (const [key, value] of Object.entries(filters)) {
            if (key in this._filters) {
                try {
                    this._filters[key].normalized = value;
                } catch {
                    setFilterErrors.push(`${buildUrl('', { [key]: value }).slice(1)}`);
                }
            } else {
                unknownFilters.push(`'${key}'`);
            }
        }

        return { unknownFilters, setFilterErrors };
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

        if (!(filter instanceof FilterModel || filter instanceof SelectionModel)) {
            throw new Error('Filter must extend FilterModel or SelectionModel');
        }

        this._filters[key] = filter;
        this._filterModels.push(filter);
        filter.observe(() => this.setFilterToURL());
        filter.visualChange$?.bubbleTo(this._visualChange$);
    }
}
