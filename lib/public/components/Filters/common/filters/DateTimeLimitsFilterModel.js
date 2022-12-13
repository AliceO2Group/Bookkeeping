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
import { formatDateForHTMLInput } from '../../../../utilities/formatting/formatDateForHTMLInput.js';
import { FilterModel } from '../FilterModel.js';

/**
 * @typedef DateTimeLimits
 * @property {string} [fromDate] the limit start date expression (format YYYY-MM-DD)
 * @property {string} [fromTime] the limit start time expression (format HH:MM)
 * @property {string} [tillDate] the limit end date expression (format YYYY-MM-DD)
 * @property {string} [tillTime] the limit end time expression (format HH:MM)
 */

const DEFAULT_RAW = {
    fromDate: '',
    fromTime: '',
    tillDate: '',
    tillTime: '',
};

/**
 * Model for a date time limits filter
 */
export class DateTimeLimitsFilterModel extends FilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._raw = { ...DEFAULT_RAW };
        this._fromTimestamp = null;
        this._tillTimestamp = null;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @override
     */
    reset() {
        this._raw = { ...DEFAULT_RAW };
        this._fromTimestamp = null;
        this._tillTimestamp = null;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @override
     */
    get isEmpty() {
        return this._fromTimestamp === null && this._tillTimestamp === null;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @override
     */
    get normalized() {
        return {
            fromTimestamp: this._fromTimestamp,
            tillTimestamp: this._tillTimestamp,
        };
    }

    /**
     * Updates the values of datetime start and end limits
     *
     * @param {DateTimeLimits} limits the date time limits
     * @param {boolean} inputIsValid flag that states if the given expressions are valid (using HTML input validation)
     *
     * @return {void}
     */
    update({ fromDate, fromTime, tillDate, tillTime }, inputIsValid) {
        this._raw = {
            fromDate: fromDate !== undefined ? fromDate : this._raw.fromDate,
            fromTime: fromTime !== undefined ? fromTime : this._raw.fromTime,
            tillDate: tillDate !== undefined ? tillDate : this._raw.tillDate,
            tillTime: tillTime !== undefined ? tillTime : this._raw.tillTime,
        };

        const { date: currentDay, time: currentTime } = formatDateForHTMLInput(new Date());
        if (this._raw.fromDate && !this._raw.fromTime) {
            this._raw.fromTime = '00:00';
        }
        if (this._raw.tillDate && !this._raw.tillTime) {
            this._raw.tillTime = this._raw.tillDate === currentDay ? currentTime : '23:59';
        }

        // eslint-disable-next-line require-jsdoc
        const extractTimestampFromExpression = (date, time) => {
            if (!date || !time) {
                return null;
            }
            return Date.parse(`${date.replace(/\//g, '-')}T${time}:00.000`);
        };

        const fromTimestamp = inputIsValid ? extractTimestampFromExpression(this._raw.fromDate, this._raw.fromTime) : null;
        const tillTimestamp = inputIsValid ? extractTimestampFromExpression(this._raw.tillDate, this._raw.tillTime) : null;

        const valuesChanges = inputIsValid && (fromTimestamp !== this._fromTimestamp || tillTimestamp !== this._tillTimestamp);

        if (valuesChanges) {
            this._fromTimestamp = fromTimestamp;
            this._tillTimestamp = tillTimestamp;
            this.notify();
        } else {
            this.visualChange$.notify();
        }
    }

    /**
     * Return the raw limits expressions
     *
     * @return {DateTimeLimits} raw limits expressions
     */
    get raw() {
        return this._raw;
    }

    /**
     * Return the timestamp of the end datetime
     *
     * @return {number} the end timestamp
     */
    get tillTimestamp() {
        return this._tillTimestamp;
    }

    /**
     * Return the timestamp of the start datetime
     *
     * @return {number} the start timestamp
     */
    get fromTimestamp() {
        return this._fromTimestamp;
    }
}
