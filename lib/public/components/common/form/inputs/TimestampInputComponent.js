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
import { StatefulComponent } from '../../StatefulComponent.js';
import { DateTimeInputComponent } from './DateTimeInputComponent.js';
import { extractTimestampFromDateTimeInput } from '../../../../utilities/formatting/dateTimeInputFormatters.mjs';
import { h } from '@aliceo2/web-ui/Frontend/js/src/index.js';

/**
 * @typedef TimestampInputComponentAttrs
 * @property {function} onChange function called with the new value when it changes
 * @property {boolean} [required] states if the inputs can be omitted
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
     * @param {object} vnode the component's inital vnode
     * @param {TimestampInputComponentAttrs} vnode.attrs the component's attributes
     */
    constructor({ attrs }) {
        super();

        const { seconds = false, onChange } = attrs;

        /**
         * @type {DateTimeInputRawData}
         * @private
         */
        this._raw = { date: '', time: '' };
        this._value = null;

        this._onChange = onChange;
        this._seconds = seconds;
    }

    /**
     * Render the component
     * @return {vnode} the component
     */
    view() {
        return h(DateTimeInputComponent, {
            value: this._raw,
            onChange: this._handleDateTimeChange.bind(this),
            seconds: this._seconds,
        });
    }

    /**
     * Handle change of date/time input and trigger the onChange
     *
     * @param {DateTimeInputRawData} raw the date/time input raw data
     * @return {void}
     * @private
     */
    _handleDateTimeChange(raw) {
        this._raw = raw;
        let value;
        try {
            value = raw.date && raw.time ? extractTimestampFromDateTimeInput(raw) : null;
        } catch (_) {
            value = null;
        }

        if (this._value !== value) {
            this._value = value;
            this._onChange(this._value);
        }
        this.notify();
    }
}
