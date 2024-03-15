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

import { Observable } from '/js/src/index.js';

/**
 * @typedef DurationInputRawData
 * @property {number} hours the number of hours
 * @property {number} minutes the number of minutes
 * @property {number} seconds the number of seconds
 */

/**
 * Store the duration input
 */
export class DurationInputModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._raw = {
            hours: null,
            minutes: null,
            seconds: null,
        };

        /**
         * Timestamp (ms)
         * @type {number|null}
         * @private
         */
        this._value = null;
    }

    /**
     * Update the inputs raw values
     * @param {DurationInputRawData} raw the input raw values
     * @return {void}
     */
    update(raw) {
        try {
            const previousVal = this._raw;
            this._raw = { ...this._raw, ...raw };

            if (this._raw.seconds === 60) {
                this._raw.minutes++;
                this._raw.seconds = 0;
            }
            if (this._raw.minutes === 60) {
                this._raw.hours++;
                this._raw.minutes = 0;
            }

            if (this._raw.seconds === -1) {
                this._raw.minutes--;
                this._raw.seconds = 59;
            }
            if (this._raw.minutes === -1) {
                this._raw.hours--;
                this._raw.minutes = 59;
            }

            if (this._raw.hours < 0) {
                this.update(previousVal);
                return;
            }
            this._value =
                (this._raw.hours || 0) * 60 * 60 * 1000 +
                (this._raw.minutes || 0) * 60 * 1000 +
                (this._raw.seconds || 0) * 1000;

            if (this._value === 0) {
                this.reset();
            }
        } catch (_) {
            this._value = null;
        }

        this.notify();
    }

    /**
     * Min input for minutes input
     */
    get minutesMin() {
        return this._raw.hours > 0 ? -1 : 0;
    }

    /**
     * Min input for seconds input
     */
    get secondsMin() {
        return this._raw.minutes > 0 ? -1 : 0;
    }

    /**
     * Reset the inputs to its initial state
     * @return {void}
     */
    reset() {
        this._raw = {
            hours: null,
            minutes: null,
            seconds: null,
        };
        this._value = null;
    }

    /**
     * Returns the raw input values
     * @return {DurationInputRawData} the raw values
     */
    get raw() {
        return this._raw;
    }

    /**
     * Returns the current date represented by the inputs (null if no valid value is represented)
     * @return {number|null} the current value
     */
    get value() {
        return this._value;
    }
}
