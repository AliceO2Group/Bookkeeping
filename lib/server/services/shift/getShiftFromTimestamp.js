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

// Duration of a shift in milliseconds
const SHIFT_DURATION = 8 * 3600 * 1000;

exports.SHIFT_DURATION = SHIFT_DURATION;

const SHIFTER_TIMEZONE = 'Europe/Zurich';

exports.SHIFTER_TIMEZONE = SHIFTER_TIMEZONE;

const PARSEABLE_DATE_FORMAT = 'fr-CH';
const FR_CH_DATETIME_REGEX = /(\d{2}).(\d{2}).(\d{4}) (\d{2}:\d{2}:\d{2})/;

const MILLISECONDS_IN_ONE_HOUR = 60 * 60 * 1000;

/**
 * Return the time offset between the shifter timezone and UTC
 *
 * @param {Date} date the date at which the offset should be computed
 * @return {number} the offset (in ms)
 */
const getShifterToUTCOffset = (date) => {
    // eslint-disable-next-line prefer-template
    const shifterLocaleDate = date.toLocaleString(PARSEABLE_DATE_FORMAT, { timeZone: SHIFTER_TIMEZONE });

    // Get unix timestamp IN THE SHIFTERS TIMEZONE
    const shifterLocalTimestamp = new Date(shifterLocaleDate.replace(FR_CH_DATETIME_REGEX, '$3-$2-$1T$4Z'))
        .getTime();

    // Offset to subtract to shifter local timestamp to get back to UTC timezone (in ms)
    return shifterLocalTimestamp - date.getTime();
};

/**
 * Return the hour (00 to 24) of the given date in the shifter's timezone
 *
 * @param {Date} date the date for which hour should be extracted
 * @return {number} the resulting hour
 */
const getShifterHour = (date) => parseInt(date.toLocaleTimeString(PARSEABLE_DATE_FORMAT, { timeZone: SHIFTER_TIMEZONE }).slice(0, 2), 10);

/**
 * Returns the shift including the given timestamp
 *
 * /!\ SHIFT HOURS ARE BASED IN GENEVA TIMEZONE /!\
 *
 * Shift periods are:
 * [23,  7) => Night
 * [ 7, 15) => Morning
 * [15, 23) => Afternoon
 *
 * @param {number} timestamp the timestamp that must be included in the shift (UNIX timestamp in ms)
 * @return {Shift} the shift
 */
exports.getShiftFromTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    date.setMinutes(0, 0, 0);

    const shifterHour = getShifterHour(date);
    // Shifts are cycling between 23, 07, 15 => shifting the hour by 1 hour simplify it by having shifts between 00, 08, 16
    const shifterHourWithOffset = (shifterHour + 1) % 24;

    const hoursSinceStartOfShift = shifterHourWithOffset % 8;
    const start = new Date(date.getTime() - MILLISECONDS_IN_ONE_HOUR * hoursSinceStartOfShift);

    /*
     * If the current timezone offset is not the same as the start of shift, we need to adapt because hours since start of shift might not be
     * Correct, shift might have lasted for 7 hours or 9 hours
     */
    const startTimezoneOffset = getShifterToUTCOffset(start) - getShifterToUTCOffset(date);
    start.setTime(start.getTime() - startTimezoneOffset);

    const end = new Date(date.getTime() + MILLISECONDS_IN_ONE_HOUR * (8 - hoursSinceStartOfShift));
    // Shifting the end the same way
    const endTimezoneOffset = getShifterToUTCOffset(end) - getShifterToUTCOffset(date);
    end.setTime(end.getTime() - endTimezoneOffset);

    const shiftTypes = ['Night', 'Morning', 'Afternoon'];
    return {
        start: start.getTime(),
        end: end.getTime(),
        period: shiftTypes[Math.floor(shifterHourWithOffset / 8)],
    };
};
