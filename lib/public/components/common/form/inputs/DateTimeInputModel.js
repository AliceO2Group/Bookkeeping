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
} from '../../../../utilities/formatting/dateTimeInputFormatters.mjs';
import { Observable } from '/js/src/index.js';

/**
 * Store the state of a date time model
 */
export class DateTimeInputModel extends Observable {
    /**
     * Constructor
     * @param {object} [configuration] the model configuration
     * @param {boolean} [configuration.seconds=false] states if the date time input granularity is seconds (else, it is minutes)
     * @param {boolean} [configuration.milliseconds=false] states if the date time input granularity is milliseconds
     */
    constructor(configuration) {
        super();

        const { seconds = false, milliseconds = false } = configuration || {};
        this._seconds = seconds;
        this._milliseconds = milliseconds;

        /**
         * @type {string}
         * @private
         */
        this._raw = '';

        /**
         * @type {number|null}
         * @private
         */
        this._value = null;
    }

    /**
     * Update the input raw value
     *
     * @param {string} raw the input raw value (datetime-local string)
     * @return {void}
     */
    update(raw) {
        this._raw = raw;

        try {
            this._value = raw ? extractTimestampFromDateTimeInput(raw) : null;
        } catch {
            this._value = null;
        }

        raw && this.notify();
    }

    /**
     * Reset the inputs to its initial state
     * @return {void}
     */
    clear() {
        this.setValue(null, true);
    }

    /**
     * States if the input model is empty (has no defined value)
     *
     * @return {boolean} true if the model is empty
     */
    get isEmpty() {
        return this._value === null;
    }

    /**
     * Returns the raw input value
     *
     * @return {string} the raw datetime-local value
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

        if (isNaN(value)) {
            return;
        }

        this._value = value;
        this._raw = value !== null
            ? formatTimestampForDateTimeInput(value, this._seconds || this._milliseconds, this._milliseconds)
            : '';

        !silent && this.notify();
    }
}
