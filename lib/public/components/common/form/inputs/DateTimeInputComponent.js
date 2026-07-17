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
import { h, StatefulComponent } from '/js/src/index.js';
import { iconX } from '/js/src/icons.js';
import { formatTimestampForDateTimeInput } from '../../../../utilities/formatting/dateTimeInputFormatters.mjs';

/**
 * @typedef DateTimeInputComponentVnode
 * @property {DateTimeInputComponentAttrs} attrs the vnode's attributes
 */

/**
 * @typedef DateTimeInputComponentAttrs
 * @property {string} value the datetime-local input value
 * @property {function} onChange function called with the new value when it changes
 * @property {boolean} [seconds=false] states if the input has granularity up to seconds (if not, granularity is minutes)
 * @property {boolean} [milliseconds=false] states if the input has granularity up to milliseconds
 * @property {boolean} [required] states if the input can be omitted
 * @property {number} [min] the timestamp of the minimum date allowed by the input (included)
 * @property {number} [max] the timestamp of the maximum date allowed by the input (excluded)
 */

/**
 * Component to fill date & time
 */
export class DateTimeInputComponent extends StatefulComponent {
    /**
     * Constructor
     * @param {DateTimeInputComponentVnode} vnode the component's vnode
     * @param {DateTimeInputComponentAttrs} vnode.attrs the component's attributes
     */
    constructor({ attrs }) {
        super();
        this._updateAttrs(attrs);
    }

    /**
     * On-create lifecycle event
     * @param {DateTimeInputComponentVnode} vnode the component's vnode
     * @param {DateTimeInputComponentAttrs} vnode.attrs the component's attributes
     * @return {void}
     */
    oncreate({ attrs }) {
        this._updateAttrs(attrs);
    }

    /**
     * On-update lifecycle event
     * @param {DateTimeInputComponentVnode} vnode the component's vnode
     * @param {DateTimeInputComponentAttrs} vnode.attrs the component's attributes
     * @return {void}
     */
    onbeforeupdate({ attrs }) {
        this._updateAttrs(attrs);
    }

    /**
     * Renders the component
     * @return {Component} the component
     */
    view() {
        const inputMin = this._minTimestamp !== null
            ? formatTimestampForDateTimeInput(this._minTimestamp, this._seconds || this._milliseconds, this._milliseconds)
            : '';
        const inputMax = this._maxTimestamp !== null
            ? formatTimestampForDateTimeInput(this._maxTimestamp, this._seconds || this._milliseconds, this._milliseconds)
            : '';

        return h('.flex-row.items-center.g2', [
            h(
                'input.form-control',
                {
                    type: 'datetime-local',
                    required: this._required,
                    value: this._value,
                    step: this._milliseconds ? 0.001 : this._seconds ? 1 : 60,
                    onchange: (e) => this._onChange(e.target.value),
                    min: inputMin,
                    max: inputMax,
                },
            ),
            h(
                '.btn.btn-pill.f7',
                { disabled: this._value === '', onclick: () => this._onChange('') },
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
        const { value, onChange, seconds, milliseconds, required = false, min = null, max = null } = attrs;

        this._value = value;
        this._onChange = onChange;

        this._seconds = seconds;
        this._milliseconds = milliseconds;

        this._required = required;

        this._minTimestamp = min;
        this._maxTimestamp = max;
    }
}
