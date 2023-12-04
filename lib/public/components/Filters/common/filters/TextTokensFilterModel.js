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
import { FilterModel } from '../FilterModel.js';

const SPLIT_PATTERN = ',';

/**
 * Model which accept string input and treats it as sequence of tokens,
 * which processed with regards of given configuration. @see TextTokensFilterModel#constructor
 */
export class TextTokensFilterModel extends FilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._splitPattern = SPLIT_PATTERN;
        this._raw = '';
        this._visualChange$ = new Observable();
    }

    /**
     * Update value kept by a filter model and inform observers that some change occured
     * @param {string} value value to be stored
     * @return {void}
     */
    update(value) {
        const { _raw: previousRaw } = this;
        this._raw = value;
        if (previousRaw === value) {
            this._visualChange$.notify();
        } else {
            this.notify();
        }
    }

    /**
     * Returns the raw value of the filter
     */
    get raw() {
        return this._raw;
    }

    /**
     * Reset the filter to its initial state
     * @return {void}
     */
    reset() {
        this._raw = '';
    }

    /**
     * States if the filter has been filled
     * @return {boolean} true if the filter is empty
     */
    isEmpty() {
        return this._raw.length === 0;
    }

    /**
     * Returns the normalized value of the filter, that can be used as URL parameter
     * @return {string[]} the normalized value
     */
    get normalized() {
        return this._raw
            .split(this._splitPattern)
            .map((token) => token.trim())
            .filter((token) => token.length > 0);
    }

    /**
     * Returns the observable notified any time there is a visual change which has no impact on the actual filter value
     * @return {Observable} the observable
     */
    get visualChange$() {
        return this._visualChange$;
    }
}
