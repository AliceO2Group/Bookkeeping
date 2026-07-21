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
 * Returns the given timestamp formatted as a datetime-local input value string (YYYY-MM-DDTHH:MM[:SS[.mmm]],
 * in the user's timezone)
 *
 * @param {number} timestamp the timestamp (ms) to format
 * @param {boolean} enableSeconds states if the input granularity is seconds (else, it is minutes)
 * @param {boolean} enableMilliseconds states if the input granularity is milliseconds
 * @return {string} the value to use as a datetime-local HTML input value
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
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    let value = `${year}-${month}-${day}T${hours}:${minutes}`;
    if (enableSeconds || enableMilliseconds) {
        const seconds = pad(date.getSeconds());
        value = `${value}:${seconds}`;
    }
    if (enableMilliseconds) {
        const milliseconds = `${date.getMilliseconds()}`.padStart(3, '0');
        value = `${value}.${milliseconds}`;
    }

    return value;
};

/**
 * Convert the given datetime-local input value (in the user's timezone) to a UNIX timestamp
 *
 * @param {string} value the datetime-local input value (YYYY-MM-DDTHH:MM[:SS[.mmm]])
 * @return {number} the resulting timestamp
 */
export const extractTimestampFromDateTimeInput = (value) => Date.parse(value);
