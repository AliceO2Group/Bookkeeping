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

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Format a date in its full format, for example `Monday January 1, 2024`
 *
 * @param {Date} date the date to format
 * @return {string} the formatted date
 */
export const formatFullDate = (date) => {
    const year = date.getFullYear();
    const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];

    return `${dayOfWeek} ${month} ${day}, ${year}`;
};
