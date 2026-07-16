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

/**
 * Returns the given date formatted in two parts, YYYY-MM-DD and HH:MM to fill in HTML date and time inputs (in the user's timezone)
 *
 * @param {number} timestamp the timestamp (ms) to format
 * @param {boolean} enableSeconds states if the time input granularity is seconds (else, it is minutes)
 * @param {boolean} enableMilliseconds states if the time input granularity is milliseconds
 * @return {DateTimeInputRawData} the date expression to use as HTML input values
 */
export const formatTimestampForDateTimeInput = (timestamp, enableSeconds, enableMilliseconds) => {
    const date = new Date(timestamp);

    /**
     * Pad a given number to 2 digits
     * @param {number} toPad the number to pad
     * @return {string} the formatted number
     */
    const pad = (toPad) => `${toPad}`.padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const dateExpression = `${year}-${month}-${day}`;

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    let timeExpression = `${hours}:${minutes}`;
    if (enableSeconds) {
        const seconds = pad(date.getSeconds());
        timeExpression = `${timeExpression}:${seconds}`;
    }
    if (enableMilliseconds) {
        const milliseconds = `${date.getMilliseconds()}`.padStart(3, '0');
        timeExpression = `${timeExpression}.${milliseconds}`;
    }

    return { date: dateExpression, time: timeExpression };
};

/**
 * Convert the given raw date-time (in the user's timezone) input to UNIX timestamp
 *
 * @param {DateTimeInputRawData} dateTime the date-time input's value
 * @return {number} the resulting timestamp
 */
export const extractTimestampFromDateTimeInput = ({ date, time }) => {
    if (time.length === 5) {
        // HH:MM -> HH:MM:SS.mmm
        time = `${time}:00.000`;
    } else if (time.length === 8) {
        // HH:MM:SS -> HH:MM:SS.mmm
        time = `${time}.000`;
    }

    return Date.parse(`${date}T${time}`);
};
