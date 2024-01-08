/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */
import { FilterModel } from '../FilterModel.js';
import { DateTimeInputModel } from '../../../common/form/inputs/DateTimeInputModel.js';

/**
 * @typedef DateTimeLimits
 * @property {string} [startDate] the limit start date expression (format YYYY-MM-DD)
 * @property {string} [startTime] the limit start time expression (format HH:MM)
 * @property {string} [endDate] the limit end date expression (format YYYY-MM-DD)
 * @property {string} [endTime] the limit end time expression (format HH:MM)
 */

/**
 * Time input step (1 minute, not configurable for now in the dateTimeInput)
 * @type {number}
 */
const TIME_STEP = 60 * 1000;

/**
 * Model for a date time limits filter
 */
export class TimeRangeFilterModel extends FilterModel {
    /**
     * Constructor
     *
     * @param {Partial<Period>} [value] the initial value of the filter
     * @param {string|null} [periodLabel] the label of the initial value if it applies (eg. current month)
     * @param {object} [configuration] the inputs configuration
     * @param {(boolean|{from: boolean, to: boolean})} [configuration.required] defines if the from/to dates are required (true means both are
     *     required)
     */
    constructor(value, periodLabel, configuration) {
        super();

        const { required = false } = configuration || {};

        this._fromTimeInputModel = new DateTimeInputModel({
            defaults: { time: '00:00' },
            required: typeof required === 'boolean' ? required : required.from,
        });
        this._toTimeInputModel = new DateTimeInputModel({
            defaults: { time: '00:00' },
            required: typeof required === 'boolean' ? required : required.to,
        });

        this._fromTimeInputModel.visualChange$.bubbleTo(this.visualChange$);
        // eslint-disable-next-line no-return-assign
        this._fromTimeInputModel.observe(() => {
            this._periodLabel = null;
            this._toTimeInputModel.min = this._fromTimeInputModel.value ? this._fromTimeInputModel.value + TIME_STEP : null;
        });
        this._fromTimeInputModel.bubbleTo(this);

        this._toTimeInputModel.visualChange$.bubbleTo(this.visualChange$);
        // eslint-disable-next-line no-return-assign
        this._toTimeInputModel.observe(() => {
            this._periodLabel = null;
            this._fromTimeInputModel.max = this._toTimeInputModel.value ? this._toTimeInputModel.value - TIME_STEP : null;
        });
        this._toTimeInputModel.bubbleTo(this);

        this.setValue(value, periodLabel, false);
    }

    /**
     * Set the current value of the filter
     * @param {Partial<Period>} value the new value of the filter
     * @param {string|null} periodLabel if the specified value correspond to a specific period (fox example current month), this is its label
     * @param {boolean} [silent] if true, the observers will not be notified
     * @return {void}
     */
    setValue(value, periodLabel = null, silent = false) {
        const { from, to } = value || {};

        if (from === this._fromTimeInputModel.value && to === this._toTimeInputModel.value) {
            return;
        }

        if (from !== undefined) {
            this._fromTimeInputModel.setValue(from, true);
            this._toTimeInputModel.min = from + TIME_STEP;
        }
        if (to !== undefined) {
            this._toTimeInputModel.setValue(to, true);
            this._fromTimeInputModel.max = to - TIME_STEP;
        }

        this._periodLabel = periodLabel;

        !silent && this.notify();
    }

    /**
     * Returns the model for time lower limit model
     *
     * @return {DateTimeInputModel} the time lower limit model
     */
    get fromTimeInputModel() {
        return this._fromTimeInputModel;
    }

    /**
     * Returns the model for time upper limit model
     *
     * @return {DateTimeInputModel} the time upper limit model
     */
    get toTimeInputModel() {
        return this._toTimeInputModel;
    }

    /**
     * If it applies, returns the label of the currently selected period (eg. current month)
     * @return {string|null} the period label
     */
    get periodLabel() {
        return this._periodLabel;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @override
     */
    reset() {
        this._fromTimeInputModel.clear();
        this._toTimeInputModel.clear();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @override
     */
    get isEmpty() {
        return this._fromTimeInputModel.value === null && this._toTimeInputModel.value === null;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @override
     * @return {Partial<Period>}
     */
    get normalized() {
        return {
            from: this._fromTimeInputModel.value ? this._fromTimeInputModel.value : undefined,
            to: this._toTimeInputModel.value ? this._toTimeInputModel.value : undefined,
        };
    }

    /**
     * States if the filter value is valid
     *
     * @return {boolean} true if the filter value is valid
     */
    get isValid() {
        return this._fromTimeInputModel.isValid && this._toTimeInputModel.isValid;
    }
}
