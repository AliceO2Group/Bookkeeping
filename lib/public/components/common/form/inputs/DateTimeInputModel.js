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

import { extractUTCTimestampFromHTMLInput, formatUTCDateForHTMLInput } from '../../../../utilities/formatting/HTMLInputDateFormat.js';
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
 * @property {number} [min] the timestamp of the minimum date allowed by the input (included)
 * @property {number} [max] the timestamp of the maximum date allowed by the input (excluded)
 */

/**
 * Store the state of a date time model
 */
export class DateTimeInputModel extends Observable {
    /**
     * Constructor
     * @param {DateTimeInputConfiguration} [configuration] the input configuration
     */
    constructor(configuration) {
        super();
        const { defaults = {}, required = false, min = null, max = null, timeStep } = configuration;

        /**
         * @type {DateTimeInputRawData}
         * @private
         */
        this._raw = { date: '', time: '' };

        const { date: defaultDate = '', time: defaultTime = '' } = defaults;

        /**
         * @type {DateTimeInputRawData}
         * @private
         */
        this._defaults = {
            date: defaultDate,
            time: defaultTime,
        };

        /**
         * @type {number|null}
         * @private
         */
        this._value = null;

        this._visualChange$ = new Observable();

        this._isRequired = required;
        this._min = min;
        this._max = max;
        this._timeStep = timeStep;
    }

    /**
     * Returns the given date formatted in two parts, YYYY-MM-DD and HH:MM to fill in HTML date and time inputs
     *
     * @param {number} timestamp the timestamp (ms) to format
     *
     * @return {DateTimeInputRawData} the date expression to use as HTML input values
     */
    formatDateForHTMLInput(timestamp) {
        // Apply offset to have the inputs displayed in the user's timezone
        return formatUTCDateForHTMLInput(timestamp - new Date(timestamp).getTimezoneOffset() * 60 * 1000);
    }

    /**
     * Convert the text from HTML date and time input to a timestamp
     *
     * @param {string} date the date input's value
     * @param {string} time the time input's value
     * @return {number} the resulting timestamp
     */
    extractTimestampFromHTMLInput(date, time) {
        // Apply offset because the inputs are displayed in the user's timezone
        const inputsTimestamp = extractUTCTimestampFromHTMLInput(date, time);
        return inputsTimestamp + new Date(inputsTimestamp).getTimezoneOffset() * 60 * 1000;
    }

    /**
     * Update the inputs raw values
     *
     * @param {Partial<DateTimeInputRawData>} patch the input values patch
     * @return {void}
     */
    update({ date, time }) {
        if (date !== undefined) {
            this._raw.date = date;
            if (time === undefined && !this._raw.time) {
                this._raw.time = this._defaults.time;
            }
        }

        if (time !== undefined) {
            this._raw.time = time;
            if (date === undefined && !this._raw.date) {
                this._raw.date = this._defaults.date;
            }
        }

        try {
            this._value = this._raw.date && this._raw.time
                ? this.extractTimestampFromHTMLInput(this._raw.date, this._raw.time)
                : null;
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
     * State if the current value is valid
     *
     * @return {boolean} true if the value is valid
     */
    get isValid() {
        if (this._value === null) {
            return !this._isRequired;
        }

        return (this._min === null || this._value >= this._min)
            && (this._max === null || this._value <= this._max);
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
     * Set the current date represented by the inputs (do not update the raw inputs)
     *
     * @param {number|null} value the new value
     */
    set value(value) {
        if (this._value === value) {
            return;
        }

        this._value = value;
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
        const newRaw = value !== null
            ? this.formatDateForHTMLInput(value)
            : { date: '', time: '' };

        if (this._raw.date !== newRaw.date || this._raw.time !== newRaw.time) {
            this._raw = newRaw;
            !silent && this.visualChange$.notify();
        }

        !silent && this.notify();
    }

    /**
     * Returns an observable notified any time a visual change occurred
     *
     * @return {Observable} the observable
     */
    get visualChange$() {
        return this._visualChange$;
    }

    /**
     * States if the input is required
     *
     * @return {boolean} true if the input is required
     */
    get isRequired() {
        return this._isRequired;
    }

    /**
     * The minimum timestamp (in ms) allowed to be represented by the input
     *
     * @return {number|null} the minimum value
     */
    get min() {
        return this._min;
    }

    /**
     * Defines the minimum timestamp allowed to be represented by the input
     *
     * @param {number|null} value the minimum timestamp (in ms)
     */
    set min(value) {
        this._min = value;
    }

    /**
     * The maximum timestamp (in ms) allowed to be represented by the input
     *
     * @return {number|null} the maximum value
     */
    get max() {
        return this._max;
    }

    /**
     * Defines the maximum timestamp allowed to be represented by the input
     *
     * @param {number|null} value the maximum timestamp (in ms)
     */
    set max(value) {
        this._max = value;
    }

    /**
     * Returns the min values to apply to the inputs
     *
     * @return {(Partial<{date: string, time: string}>|null)} the min values
     */
    get inputsMin() {
        if (this._min === null) {
            return null;
        }

        const minDateDayAfter = new Date(this._min + MILLISECONDS_IN_ONE_DAY);

        const minDateAndTime = this.formatDateForHTMLInput(this._min);
        return minDateAndTime;
        // const ret = {};

        // if (this._raw.date !== null && this._raw.date === minDateAndTime.date) {
        //     ret.time = minDateAndTime.time;
        // }

        // if (this._raw.time !== null && this._raw.time < minDateAndTime.time) {
        //     ret.date = this.formatDateForHTMLInput(minDateDayAfter.getTime()).date;
        // } else {
        //     ret.date = minDateAndTime.date;
        // }

        return ret;
    }

    /**
     * Returns the max values to apply to the inputs
     *
     * @return {(Partial<{date: string, time: string}>|null)} the max values
     */
    get inputsMax() {
        if (this._max === null) {
            return null;
        }

        const maxDateDayBefore = new Date(this._max - MILLISECONDS_IN_ONE_DAY);

        const maxDateAndTime = this.formatDateForHTMLInput(this._max);
        return maxDateAndTime;
        // const ret = {};

        // if (this._raw.date !== null && this._raw.date === maxDateAndTime.date) {
        //     ret.time = maxDateAndTime.time;
        // }
        // if (this._raw.time !== null && this._raw.time > maxDateAndTime.time) {
        //     ret.date = this.formatDateForHTMLInput(maxDateDayBefore.getTime()).date;
        // } else {
        //     ret.date = maxDateAndTime.date;
        // }

        // return ret;
    }

    /**
     * Get time input step
     */
    get timeStep() {
        return this._timeStep;
    }
}
