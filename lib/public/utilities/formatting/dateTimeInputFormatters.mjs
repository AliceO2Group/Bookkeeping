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
 *
 * @return {DateTimeInputRawData} the date expression to use as HTML input values
 */
export const formatTimestampForDateTimeInput = (timestamp) => {
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
    const seconds = pad(date.getSeconds());
    const timeExpression = `${hours}:${minutes}:${seconds}`;

    return { date: dateExpression, time: timeExpression };
};

/**
 * Convert the given raw date-time (in the user's timezone) input to UNIX timestamp
 *
 * @param {DateTimeInputRawData} dateTime the date-time input's value
 * @return {number} the resulting timestamp
 */
export const extractTimestampFromDateTimeInput = ({ date, time }) => {
    // Add seconds if they are not already here
    if (time.length === 5) {
        time = `${time}:00`;
    }

    return Date.parse(`${date}T${time}.000`);
};
