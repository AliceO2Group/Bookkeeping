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
        this._isAnonymousExcluded = false;
    }

    /**
     * Specify whether the anonymous authors should be excluded.
     *
     * @param {boolean} isExcluded whether the anonymous authors should be excluded
     * @returns {void}
     */
    setIsAnonymousExcluded(isExcluded) {
        this._isAnonymousExcluded = isExcluded;
        this.notify();
    }

    /**
     * States whether the anonymous authors should be excluded.
     *
     * @returns {boolean} true if anonymous authors should be excluded
     */
    getIsAnonymousExcluded() {
        return this._isAnonymousExcluded;
    }

    /**
     * Reset the filter to its default value
     *
     * @return {void}
     */
    reset() {
        super.reset();
        this._isAnonymousExcluded = false;
    }

    /**
     * States wheter the author filters have been filled or toggled
     *
     * @return {boolean} true if the filters haven't been filled or toggled
     */
    isEmpty() {
        return super.isEmpty && !this._isAnonymousExcluded;
    }

    /**
     * Returns the filter query parameters based on the state of the author filter
     *
     * @returns {string[]} The author filter query parameters
     */
    getFilterQueryParams() {
        const filterQueryParams = [];

        if (this._isAnonymousExcluded) {
            filterQueryParams.push('!Anonymous');
        }

        if (!super.isEmpty) {
            filterQueryParams.push(super.value);
        }

        return filterQueryParams;
    }
}
