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
import { h } from '/js/src/index.js';
import { iconX } from '/js/src/icons.js';
import { MILLISECONDS_IN_ONE_DAY } from '../../../../utilities/dateUtils.mjs';
import { formatTimestampForDateTimeInput } from '../../../../utilities/formatting/dateTimeInputFormatters.mjs';
import { StatefulComponent } from '../../StatefulComponent.js';

/**
 * @typedef DateTimeInputComponentVnode
 * @property {DateTimeInputComponentAttrs} attrs the vnode's attributes
 */

/**
 * @typedef DateTimeInputComponentAttrs
 * @property {DateTimeInputRawData} value the actual inputs values
 * @property {function} onChange function called with the new value when it changes
 * @property {Partial<DateTimeInputRawData>} [defaults] the default raw values to use when partially updating inputs
 * @property {boolean} [seconds=false] states if the input has granularity up to seconds (if not, granularity is minutes)
 * @property {boolean} [required] states if the inputs can be omitted
 * @property {number} [min] the timestamp of the minimum date allowed by the input (included)
 * @property {number} [max] the timestamp of the maximum date allowed by the input (excluded)
 */

/**
 * Component to fill date & time
 */
export class DateTimeInputComponent extends StatefulComponent {
    /**
     * Constructor
     * @property {DateTimeInputComponentVnode} vnode the component's vnode
     */
    constructor({ attrs }) {
        super();
        this._updateAttrs(attrs);
    }

    /**
     * On-create lifecycle event
     * @property {DateTimeInputComponentVnode} vnode the component's vnode
     * @return {void}
     */
    oncreate({ attrs }) {
        this._updateAttrs(attrs);
    }

    /**
     * On-update lifecycle event
     * @property {DateTimeInputComponentVnode} vnode the component's vnode
     * @return {void}
     */
    onupdate({ attrs }) {
        this._updateAttrs(attrs);
    }

    /**
     * Renders the component
     * @return {Component} the component
     */
    view() {
        const inputsMin = this._getInputsMin(this._minTimestamp, this._value);
        const inputsMax = this._getInputsMax(this._maxTimestamp, this._value);

        return h('.flex-row.items-center.g2', [
            h(
                'input.form-control',
                {
                    type: 'date',
                    // Firefox shrinks the date inputs, apply a min-width to it
                    style: { minWidth: '9rem' },
                    required: this._required,
                    value: this._value.date,
                    onchange: (e) => this._patchValue({ date: e.target.value }),
                    // Mithril do not remove min/max if previously set...
                    min: inputsMin?.date ?? '',
                    max: inputsMax?.date ?? '',
                },
            ),
            h(
                'input.form-control',
                {
                    type: 'time',
                    required: this._required,
                    value: this._value.time,
                    step: this._seconds ? 1 : undefined,
                    onchange: (e) => this._patchValue({ time: e.target.value }),
                    // Mithril do not remove min/max if previously set...
                    min: inputsMin?.time ?? '',
                    max: inputsMax?.time ?? '',
                },
            ),
            h(
                '.btn.btn-pill.f7',
                { disabled: this._value.date === '' && this._value.time === '', onclick: () => this._patchValue({ date: '', time: '' }) },
                iconX(),
            ),
        ]);
    }

    /**
     * Parse the vnode's attributes to update the component's state
     *
     * @param {DateTimeInputComponentAttrs} attrs the attributes
     * @return {void}
     * @private
     */
    _updateAttrs(attrs) {
        const { value, onChange, seconds, required = false, defaults = {}, min = null, max = null } = attrs;
        const { date: defaultDate = '', time: defaultTime = '' } = defaults;

        this._value = value;
        this._onChange = onChange;

        this._seconds = seconds;

        this._required = required;

        /**
         * @type {DateTimeInputRawData}
         * @private
         */
        this._defaults = {
            date: defaultDate,
            time: defaultTime,
        };

        this._minTimestamp = min;
        this._maxTimestamp = max;
    }

    /**
     * Update the inputs values
     *
     * @param {Partial<DateTimeInputRawData>} patch the input values patch
     * @return {void}
     */
    _patchValue({ time, date }) {
        if (date !== undefined) {
            this._value.date = date;
            if (time === undefined && !this._value.time) {
                this._value.time = this._defaults.time;
            }
        }

        if (time !== undefined) {
            this._value.time = time;
            if (date === undefined && !this._value.date) {
                this._value.date = this._defaults.date;
            }
        }

        this._onChange(this._value);
    }

    /**
     * Returns the min values to apply to the inputs
     *
     * @param {number|null} minTimestamp the minimal timestamp to represent in the inputs
     * @param {DateTimeInputRawData} raw the current raw values
     * @return {(Partial<{date: string, time: string}>|null)} the min values to apply to date and time inputs
     */
    _getInputsMin(minTimestamp, raw) {
        if (minTimestamp === null) {
            return null;
        }

        const rawDate = raw.date || null;
        const rawTime = raw.time || null;

        const minDateAndTime = formatTimestampForDateTimeInput(minTimestamp, this._seconds);
        const inputsMin = {};

        if (rawDate !== null && rawDate === minDateAndTime.date) {
            inputsMin.time = minDateAndTime.time;
        }

        if (rawTime !== null && rawTime < minDateAndTime.time) {
            inputsMin.date = formatTimestampForDateTimeInput(minTimestamp + MILLISECONDS_IN_ONE_DAY, this._seconds).date;
        } else {
            inputsMin.date = minDateAndTime.date;
        }

        return inputsMin;
    }

    /**
     * Returns the max values to apply to the inputs
     *
     * @param {number|null} maxTimestamp the maximal timestamp to represent in the inputs
     * @param {DateTimeInputRawData} raw the current raw values
     * @return {(Partial<{date: string, time: string}>|null)} the max values
     */
    _getInputsMax(maxTimestamp, raw) {
        if (maxTimestamp === null) {
            return null;
        }

        const rawDate = raw.date || null;
        const rawTime = raw.time || null;

        const maxDateAndTime = formatTimestampForDateTimeInput(maxTimestamp, this._seconds);
        const inputsMax = {};

        if (rawDate !== null && rawDate === maxDateAndTime.date) {
            inputsMax.time = maxDateAndTime.time;
        }
        if (rawTime !== null && rawTime > maxDateAndTime.time) {
            inputsMax.date = formatTimestampForDateTimeInput(maxTimestamp - MILLISECONDS_IN_ONE_DAY, this._seconds).date;
        } else {
            inputsMax.date = maxDateAndTime.date;
        }

        return inputsMax;
    }
}
