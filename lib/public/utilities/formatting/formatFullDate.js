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

/**
 * Format a date in its full format, for example `Monday January 1, 2024`
 *
 * @param {Date} date the date to format
 * @return {string} the formatted date
 */
export const formatFullDate = (date) => {
    const year = date.getFullYear();
    const day = date.getDate();
    const dayOfWeek = date.toLocaleString('en', { weekday: 'long' });
    const month = date.toLocaleString('en', { month: 'long' });

    return `${dayOfWeek} ${month} ${day}, ${year}`;
};
