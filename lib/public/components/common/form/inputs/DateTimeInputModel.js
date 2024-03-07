/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import {
    extractTimestampFromDateTimeInput,
    formatTimestampForDateTimeInput,
} from '../../../../utilities/formatting/HTMLInputDateFormat.js';
import { Observable } from '/js/src/index.js';
import { MILLISECONDS_IN_ONE_DAY } from '../../../../utilities/dateUtils.js';

/**
 * @typedef DateTimeInputRawData
 * @property {string} date the raw date value
 * @property {string} time the raw time value
 */

/**
 * @typedef DateTimeInputConfiguration
 * @property {Partial<DateTimeInputRawData>} [defaults] the default raw values to use when partially updating inputs
 * @property {boolean} [required] states if the input can be null
 */

/**
 * Store the state of a date time model
 */
export class DateTimeInputModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        /**
         * @type {DateTimeInputRawData}
         * @private
         */
        this._raw = { date: '', time: '' };

        /**
         * @type {number|null}
         * @private
         */
        this._value = null;
    }

    /**
     * Update the inputs raw values
     *
     * @param {DateTimeInputRawData} raw the input raw values
     * @return {void}
     */
    update(raw) {
        this._raw = raw;
        try {
            this._value = raw.date && raw.time ? extractTimestampFromDateTimeInput(raw) : null;
        } catch (_) {
            this._value = null;
        }

        this.notify();
    }

    /**
     * Reset the inputs to its initial state
     * @return {void}
     */
    clear() {
        this._raw = { date: '', time: '' };
        this._value = null;
        this.notify();
    }

    /**
     * Returns the raw input values
     *
     * @return {DateTimeInputRawData} the raw values
     */
    get raw() {
        return this._raw;
    }

    /**
     * Returns the current date represented by the inputs (null if no valid value is represented)
     *
     * @return {number|null} the current value
     */
    get value() {
        return this._value;
    }

    /**
     * Set the current date represented by the inputs and update the raw values accordingly
     *
     * @param {number|null} value the new value
     * @param {boolean} [silent] if true, observers will not be notified of the change
     * @return {void}
     */
    setValue(value, silent) {
        if (value === this._value) {
            return;
        }

        this._value = value;
        this._raw = value !== null
            ? formatTimestampForDateTimeInput(value)
            : { date: '', time: '' };

        !silent && this.notify();
    }
}
