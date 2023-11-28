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
export class FilterModel extends Observable {
    /**
     * Constructor
     * @param {RegExp} [inputValidationPattern] regex to validate input
     * @param {RegExp|string} [splitPattern = ' '] regex for splitting input into tokens
     */
    constructor(inputValidationPattern, splitPattern = ' ') {
        super();
        this._inputValidationPattern = inputValidationPattern;
        this._splitPattern = splitPattern;
        this._raw = '';
        this._visualChange$ = new Observable();
    }

    /**
     * Reset the filter to its initial state
     *
     * @return {void}
     * @abstract
     */
    reset() {
        this._raw = '';
    }

    /**
     * States if the filter has been filled with a valid value
     *
     * @return {boolean} true if the filter is filled
     */
    get isEmpty() {
        return this._raw.length > 0;
    }

    /**
     * Returns the normalized value of the filter, that can be used as URL parameter
     *
     * @return {string[]} the normalized value
     */
    get normalized() {
        return this._raw.split(this._splitPattern).map((token) => token.trim());
    }

    /**
     * Returns the observable notified any time there is a visual change which has no impact on the actual filter value
     *
     * @return {Observable} the observable
     */
    get visualChange$() {
        return this._visualChange$;
    }

    /**
     * States if the filter value is valid
     *
     * @return {boolean} true if the filter value is valid
     */
    get isValid() {
        return this._inputValidationPattern.test(this._raw);
    }
}
