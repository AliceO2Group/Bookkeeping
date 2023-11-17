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
 * Returns the given date formatted in two parts, YYYY-MM-DD and HH:MM to fill in HTML date and time inputs (UTC)
 *
 * @param {number} timestamp the timestamp (ms) to format
 *
 * @return {{date: string, time: string}} the date expression to use as HTML input values
 */
export const formatUTCDateForHTMLInput = (timestamp) => {
    const date = new Date(timestamp);
    const [dateExpression] = date.toISOString().split('T');
    const hours = `${date.getUTCHours()}`.padStart(2, '0');
    const minutes = `${date.getUTCMinutes()}`.padStart(2, '0');
    const timeExpression = `${hours}:${minutes}`;

    return { date: dateExpression, time: timeExpression };
};

/**
 * Convert the text from HTML date and time input (UTC) to a timestamp
 *
 * @param {string} date the date input's value
 * @param {string} time the time input's value
 * @return {number} the resulting timestamp
 */
export const extractUTCTimestampFromHTMLInput = (date, time) => {
    // Add seconds if they are not already here
    if (time.length === 5) {
        time = `${time}:00`;
    }

    const timestamp = Date.parse(`${date}T${time}.000`);
    const localeDate = new Date(timestamp);

    return timestamp - localeDate.getTimezoneOffset() * 60 * 1000;
};
