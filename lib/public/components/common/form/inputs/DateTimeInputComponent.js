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
import { MILLISECONDS_IN_ONE_DAY } from '../../../../utilities/dateUtils.js';
import { formatTimestampForDateTimeInput } from '../../../../utilities/formatting/HTMLInputDateFormat.js';
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
        const inputsMin = this._getInputsMin(this._min, this._value);
        const inputsMax = this._getInputsMax(this._max, this._value);

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
                    min: inputsMin ? inputsMin.date : undefined,
                    max: inputsMax ? inputsMax.date : undefined,
                },
            ),
            h(
                'input.form-control',
                {
                    type: 'time',
                    required: this._required,
                    value: this._value.time,
                    onchange: (e) => this._patchValue({ time: e.target.value }),
                    min: inputsMin ? inputsMin.time : undefined,
                    max: inputsMax ? inputsMax.time : undefined,
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
        const { value, onChange, required = false, defaults = {}, min = null, max = null } = attrs;
        const { date: defaultDate = '', time: defaultTime = '' } = defaults;

        this._value = value;
        this._onChange = onChange;

        this._required = required;

        /**
         * @type {DateTimeInputRawData}
         * @private
         */
        this._defaults = {
            date: defaultDate,
            time: defaultTime,
        };

        this._min = min;
        this._max = max;
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
     * @param {number|null} min the minimal timestamp to represent in the inputs
     * @param {DateTimeInputRawData} raw the current raw values
     * @return {(Partial<{date: string, time: string}>|null)} the min values to apply to date and time inputs
     */
    _getInputsMin(min, raw) {
        if (min === null) {
            return null;
        }

        const minDateDayAfter = new Date(min + MILLISECONDS_IN_ONE_DAY);

        const minDateAndTime = formatTimestampForDateTimeInput(min);
        const ret = {};

        if (raw.date !== null && raw.date === minDateAndTime.date) {
            ret.time = minDateAndTime.time;
        }

        if (raw.time !== null && raw.time < minDateAndTime.time) {
            ret.date = formatTimestampForDateTimeInput(minDateDayAfter.getTime()).date;
        } else {
            ret.date = minDateAndTime.date;
        }

        return ret;
    }

    /**
     * Returns the max values to apply to the inputs
     *
     * @param {number|null} max the maximal timestamp to represent in the inputs
     * @param {DateTimeInputRawData} raw the current raw values
     * @return {(Partial<{date: string, time: string}>|null)} the max values
     */
    _getInputsMax(max, raw) {
        if (max === null) {
            return null;
        }

        const maxDateDayBefore = new Date(max - MILLISECONDS_IN_ONE_DAY);

        const maxDateAndTime = formatTimestampForDateTimeInput(max);
        const ret = {};

        if (raw.date !== null && raw.date === maxDateAndTime.date) {
            ret.time = maxDateAndTime.time;
        }
        if (raw.time !== null && raw.time > maxDateAndTime.time) {
            ret.date = formatTimestampForDateTimeInput(maxDateDayBefore.getTime()).date;
        } else {
            ret.date = maxDateAndTime.date;
        }

        return ret;
    }
}
