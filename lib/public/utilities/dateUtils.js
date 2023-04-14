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

export const LOCALE_DATE_FORMAT = 'en-GB';
const DATE_STYLE = 'short';
const TIME_STYLE = 'medium';

/**
 * Returns the english-formatted date and time components of a given timestamp
 *
 * @param {number} timestamp the UNIX timestamp (in ms) to format
 * @param {object} [options] eventual options to pass to date and time formatting such as timezone
 * @return {{date: string, time: string}} the formatted components
 */
export const getLocaleDateAndTime = (timestamp, options) => {
    const dateObject = new Date(timestamp);
    options = options || {};

    return {
        date: dateObject.toLocaleDateString(LOCALE_DATE_FORMAT, { dateStyle: DATE_STYLE, ...options }),
        time: dateObject.toLocaleTimeString(LOCALE_DATE_FORMAT, { timeStyle: TIME_STYLE, ...options }),
    };
};
