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
import { DateTimeInputComponent } from './DateTimeInputComponent.js';
import {
    extractTimestampFromDateTimeInput,
    formatTimestampForDateTimeInput,
} from '../../../../utilities/formatting/dateTimeInputFormatters.mjs';
import { h, StatefulComponent } from '/js/src/index.js';

/**
 * @typedef TimestampInputComponentAttrs
 * @property {function} onChange function called with the new value when it changes
 * @property {boolean} [required] states if the inputs can be omitted
 * @property {number} [value] the default value (ms timestamp) of the input
 * @property {boolean} [seconds=false] states if the input has granularity up to seconds (if not, granularity is minutes)
 */

/**
 * Non-controlled component providing user date & time inputs to fill a timestamp
 *
 * Because the raw data of the inputs can not be represented by a timestamp (for example partial fill of the inputs), this input is not
 * controlled and simply notify when its actual value changes
 */
export class TimestampInputComponent extends StatefulComponent {
    /**
     * Constructor
     * @param {object} vnode the component's initial vnode
     * @param {TimestampInputComponentAttrs} vnode.attrs the component's attributes
     */
    constructor({ attrs }) {
        super();

        const { seconds = false, onChange, value = null } = attrs;

        /**
         * @type {string} - format YYYY-MM-DDTHH:MM[:SS[.mmm]]
         * @private
         */
        this._raw = '';

        /**
         * @type {number|null} - timestamp in ms
         * @private
         */
        this._value = value;

        this._onChange = onChange;
        this._seconds = seconds;
    }

    /**
     * Render the component
     * @param {object} vnode the component's vnode
     * @param {TimestampInputComponentAttrs} vnode.attrs the component's attributes
     * @return {vnode} the component
     */
    view({ attrs }) {
        if (attrs.value) {
            this._value = attrs.value;
            this._raw = formatTimestampForDateTimeInput(attrs.value, this._seconds);
        }

        return h(DateTimeInputComponent, {
            value: this._raw,
            onChange: this._handleDateTimeChange.bind(this),
            seconds: this._seconds,
        });
    }

    /**
     * Handle change of datetime-local input and trigger the onChange
     *
     * @param {string} raw the datetime-local input value
     * @return {void}
     * @private
     */
    _handleDateTimeChange(raw) {
        this._raw = raw;
        let value;
        try {
            value = raw ? extractTimestampFromDateTimeInput(raw) : null;
        } catch {
            value = null;
        }

        if (this._value !== value) {
            this._value = value;
            this._onChange(this._value);
        }
        this.notify();
    }
}
