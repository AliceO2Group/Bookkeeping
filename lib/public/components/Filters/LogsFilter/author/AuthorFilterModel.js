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

import { FilterInputModel } from '../../common/filters/FilterInputModel.js';

/**
 * Model to handle the state of the Author Filter
 */
export class AuthorFilterModel extends FilterInputModel {
    /**
     * Constructor
     *
     * @constructor
     */
    constructor() {
        super();
        this._excludeAnonymous = true;
    }

    /**
     * Specify whether the anonymous authors should be excluded.
     *
     * @param {boolean} exclude whether the anonymous authors should be excluded
     * @returns {void}
     */
    setExcludeAnonymous(exclude) {
        this._excludeAnonymous = exclude;
        this.notify();
    }

    /**
     * Reset the filter to its default value
     *
     * @return {void}
     */
    reset() {
        super.reset();
        this._excludeAnonymous = true;
    }

    /**
     * States whether the anonymous authors should be excluded.
     *
     * @returns {boolean} true if anonymous authors should be excluded
     */
    get excludeAnonymous() {
        return this._excludeAnonymous;
    }

    /**
     * States whether the author filter has changed from its default state
     *
     * @returns {boolean} true if the author filter has changed from its default state
     */
    get hasChanged() {
        return this._excludeAnonymous === false || super.isEmpty === false;
    }

    /**
     * Returns the filter query parameters based on the state of the author filter
     *
     * @returns {string[]} The author filter query parameters
     */
    get filterQueryParams() {
        const filterQueryParams = [];

        if (this._excludeAnonymous) {
            filterQueryParams.push('!Anonymous');
        }

        if (!super.isEmpty) {
            filterQueryParams.push(super.value);
        }

        return filterQueryParams;
    }
}
