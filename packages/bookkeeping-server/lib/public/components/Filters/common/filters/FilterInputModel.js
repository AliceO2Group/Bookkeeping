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
 * Model for a generic filter input
 */
export class FilterInputModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._value = null;
        this._raw = '';

        this._visualChange$ = new Observable();
    }

    /**
     * Define the current value of the filter
     *
     * @param {string} raw the raw value of the filter
     * @return {void}
     */
    update(raw) {
        const previousValues = this.value;

        this._value = this.valueFromRaw(raw);
        this._raw = raw;

        if (this.areValuesEquals(this.value, previousValues)) {
            // Only raw value changed
            this._visualChange$.notify();
        } else {
            this.notify();
        }
    }

    /**
     * Reset the filter to its default value
     *
     * @return {void}
     */
    reset() {
        this._value = null;
        this._raw = '';
    }

    /**
     * Returns the raw value of the filter (the user input)
     *
     * @return {string} the raw value
     */
    get raw() {
        return this._raw;
    }

    /**
     * Return the parsed values of the filter
     *
     * @return {*} the parsed values
     */
    get value() {
        return this._value;
    }

    /**
     * States if the filter has been filled
     *
     * @return {boolean} true if the filter has been filled
     */
    get isEmpty() {
        return !this.value;
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
     * Returns the processed value from raw input
     *
     * @param {string} raw the raw input value
     * @return {*} the processed value
     * @protected
     */
    valueFromRaw(raw) {
        return raw.trim();
    }

    /**
     * Compares two values
     *
     * @param {*} first the first value
     * @param {*} second the second value
     * @return {boolean} true if the values are equals
     * @protected
     */
    areValuesEquals(first, second) {
        return first === second;
    }
}
