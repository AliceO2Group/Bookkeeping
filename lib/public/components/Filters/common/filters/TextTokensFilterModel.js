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
 * Model for text input
 */
export class TextTokensFilterModel extends Observable {
    /**
     * Constructor
     * @param {RegExp} [inputValidationPattern] regex to validate input
     * @param {RegExp|string} [splitPattern = null] regex for splitting input into tokens,
     * it should describe delimiter between tokens. It might be single comma e.g. ',' or RegEx like /[ ,;]+/
     * By defauly it's null so input is not splitted
     */
    constructor(inputValidationPattern, splitPattern = null) {
        super();
        this._inputValidationPattern = inputValidationPattern;
        this._splitPattern = splitPattern;
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
        if (this._normalizedEqual(value) || previousRaw === value) {
            if (this.isValid) {
                this.notify();
            } else {
                this._visualChange$.notify();
            }
        } else {
            this.notify();
        }
    }

    /**
     * Getter to raw value stored by a model
     */
    get raw() {
        return this._raw;
    }

    /**
     * Reset the filter to its initial state
     * @return {void}
     * @abstract
     */
    reset() {
        this._raw = '';
    }

    /**
     * States if the filter has been filled with a valid value
     * @return {boolean} true if the filter is filled
     */
    isEmpty() {
        return this._raw.length === 0;
    }

    /**
     * Returns the normalized value of the raw
     * @param {string} value value
     * @return {string[]} the normalized value
     * @private
     */
    _normalize(value) {
        return value
            .split(this._splitPattern)
            .map((token) => token.trim())
            .filter((token) => this._inputValidationPattern.test(token));
    }

    /**
     * Compare values after normalization
     * @param {string} value value to be compared with current one in a model
     * @return {boolean} true if filter values are equal after normalization
     */
    _normalizedEqual(value) {
        return JSON.stringify(this.normalized) === JSON.stringify(this._normalize(value));
    }

    /**
     * Returns the normalized value of the filter, that can be used as URL parameter
     * @return {string[]} the normalized value
     */
    get normalized() {
        return this._normalize(this._raw);
    }

    /**
     * Returns the observable notified any time there is a visual change which has no impact on the actual filter value
     * @return {Observable} the observable
     */
    get visualChange$() {
        return this._visualChange$;
    }

    /**
     * States if the filter value is valid
     * @return {boolean} true if the filter value is valid
     */
    get isValid() {
        return this.isEmpty() || this._inputValidationPattern.test(this._raw);
    }
}
