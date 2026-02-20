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
import { FilterModel } from '../FilterModel';

/**
 * Model for a generic filter input
 */
export class FilterInputModel extends FilterModel {
    /**
     * Constructor
     *
     * @param {callback} parse function called to parse a value from a raw value
     */
    constructor(parse) {
        super();

        this.parse = parse;
        this._value = null;
        this._raw = '';
    }

    /**
     * Define the current value of the filter
     *
     * @param {string} raw the raw value of the filter
     * @override
     * @return {void}
     */
    update(raw) {
        const value = this._parse(raw);

        if (!this.areValuesEquals(this._value, value)) {
            this._value = value;
            this.notify();
        }
    }

    /**
     * @inheritdoc
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
     * @inheritdoc
     */
    get normalized() {
        return this.value;
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
