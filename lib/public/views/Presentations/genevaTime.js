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

const GENEVA_TIME_ZONE = 'Europe/Zurich';

const genevaClock = new Intl.DateTimeFormat('en-GB', {
    timeZone: GENEVA_TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
});

/**
 * Return how far the clocks in Geneva are ahead of UTC at a given moment
 *
 * @param {number} timestamp the moment, as a UNIX timestamp in milliseconds
 * @return {number} the difference in milliseconds
 */
const getGenevaOffset = (timestamp) => {
    const parts = Object.fromEntries(genevaClock.formatToParts(new Date(timestamp)).map(({ type, value }) => [type, Number(value)]));
    const shownAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    return shownAsUtc - Math.floor(timestamp / 1000) * 1000;
};

/**
 * Return the moment at which the clocks in Geneva show the date and time that the browser's clock shows at the given moment
 *
 * The period picker works in the time zone of the browser. With this function, the dates and times a user picks mean Geneva
 * time for every user, whatever the time zone of their computer.
 *
 * @param {number} timestamp the picked moment, as a UNIX timestamp in milliseconds
 * @return {number} the moment in Geneva time, as a UNIX timestamp in milliseconds
 */
export const asGenevaTime = (timestamp) => {
    const picked = new Date(timestamp);
    const pickedAsUtc = Date.UTC(
        picked.getFullYear(),
        picked.getMonth(),
        picked.getDate(),
        picked.getHours(),
        picked.getMinutes(),
        picked.getSeconds(),
        picked.getMilliseconds(),
    );
    // The difference with UTC is taken at the result, as it changes when the clocks in Geneva go forward or back
    const firstGuess = pickedAsUtc - getGenevaOffset(pickedAsUtc);
    return pickedAsUtc - getGenevaOffset(firstGuess);
};

/**
 * Return the moment at which the browser's clock shows the date and time that a UTC clock shows at the given moment
 *
 * The predefined periods of the period picker, such as a week or a month, start and end at midnight in UTC. With this function,
 * the picker shows them from midnight to midnight for every user.
 *
 * @param {number} timestamp the moment, as a UNIX timestamp in milliseconds
 * @return {number} the moment with the same date and time on the browser's clock, as a UNIX timestamp in milliseconds
 */
export const utcClockAsLocalTime = (timestamp) => {
    const utc = new Date(timestamp);
    return new Date(
        utc.getUTCFullYear(),
        utc.getUTCMonth(),
        utc.getUTCDate(),
        utc.getUTCHours(),
        utc.getUTCMinutes(),
        utc.getUTCSeconds(),
        utc.getUTCMilliseconds(),
    ).getTime();
};
