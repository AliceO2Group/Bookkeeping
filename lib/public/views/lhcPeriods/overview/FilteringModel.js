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
 * Filtering model which responisbilties are
 * 1. Store filtering params in organiesed way
 * 2. Allow to put and retrive those information
 * Second point is dependat on particual filtering configuration provided during instation.
 */
export class FilterigModel extends Observable {
    /**
     * Consturctor
     * @param {Object<string, {formatToApi: Function<*, string|undefined>}>} filteringConfiguratin filtering configuration
     * which provide `formatToApi` function for given target
     *
     * Target is e.g. column from some view.
     * `formatToApi` is function transforming stored values, related to given target, to format used in given API.
     * Each target must be provided with `formatToApi`
     */
    constructor(filteringConfiguratin) {
        super();
        this._areFiltersVisible = false;
        this._filteringOptions = Object.fromEntries(Object.entries(filteringConfiguratin)
            .map(([filterTargetName, filterDefinition]) => {
                const { formatToApi } = filterDefinition;
                if (!formatToApi) {
                    throw new Error(`Invalid filtering configuration, not formatToApi for target <${filterTargetName}>`);
                }
                return [filterTargetName, { formatToApi, values: null }];
            }));
    }

    /**
     * Put new filtering information for given target
     * @param {string} target filtering target
     * @param {*} values filtering values
     * @returns {void}
     */
    put(target, values) {
        this._filteringOptions[target].values = values;
        this.notify();
    }

    /**
     * Get filtering values for a given target
     * @param {string} target target
     * @returns {*} filtering information
     */
    get(target) {
        return this._filteringOptions[target].values;
    }

    /**
     * Build filtering search query from using stored filters information
     * @returns {string} filtering seqrch query
     */
    toSeqrchQueryParamsString() {
        return Object.entries(this._filteringOptions)
            .filter(([_, { values }]) => values?.length > 0 || values)
            .map(([_, { values, formatToApi }]) => formatToApi(values))
            .join('&');
    }

    /**
     * Examine wthere at least one filter is active
     * @returns {boolean} true if any filter active, false otherwise
     */
    isAnyFilterActive() {
        return Object.entries(this._filteringOptions).some(({ values }) => values?.length > 0 || values);
    }

    /**
     * Returns information whether filters component should be visble
     * @returns {boolean} true if some filters are active, false otherwise
     */
    get areFiltersVisible() {
        return this._areFiltersVisible;
    }

    /**
     * Toggles whether the filters are shown
     * @returns {void}
     */
    toggleFiltersVisibility() {
        this._areFiltersVisible = !this._areFiltersVisible;
    }

    /**
     * Reset all filter
     * @returns {void}
     */
    reset() {
        for (const target in this._filteringOptions) {
            this._filteringOptions[target].values = null;
        }
        this.notify();
    }
}
