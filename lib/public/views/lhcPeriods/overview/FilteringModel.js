/* eslint-disable constructor-super */
/* eslint-disable require-jsdoc */
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
 * Filtering model
 */
export class FilterigModel extends Observable {
    constructor(filteringConf) {
        super();
        this._areFiltersVisible = false;
        this._filteringOptions = Object.fromEntries(Object.entries(filteringConf)
            .map(([filterTargetName, filterDefinition]) => {
                const { filter, parser } = filterDefinition;
                if (!filter && parser || filter && !parser) {
                    throw new Error(`Invalid filtering configuration for target <${filterTargetName}>`);
                }
                return [filterTargetName, { parser, values: null }];
            }));
    }

    put(target, values) {
        this._filteringOptions[target].values = values;
        this.notify();
    }

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
            .map(([_, { values, parser }]) => parser(values))
            .join('&');
    }

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
        this.notify();
    }
}
