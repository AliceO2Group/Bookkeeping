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
 * @property {number} minutes the number of minutes, from range [0, 59]
 * @property {number} seconds the number of seconds, from range [0, 59]
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
            this._raw = { ...this._raw, ...raw };
            const { hours, minutes, seconds } = this._raw;
            if ((hours ?? minutes ?? seconds ?? null) === null) {
                this._value = null;
            } else {
                this._value = (hours || 0) * 60 * 60 * 1000
                    + (minutes || 0) * 60 * 1000
                    + (seconds || 0) * 1000;
            }
        } catch {
            this._value = null;
        }

        this.notify();
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
