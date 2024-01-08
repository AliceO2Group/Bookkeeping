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

const SERVER_DATE_FORMAT = 'en-GB';

exports.SERVER_DATE_FORMAT = SERVER_DATE_FORMAT;

const SERVER_DATE_OPTIONS = { timeZone: 'UTC' };

/**
 * Format a given date to be used for logs
 *
 * @param {Date} [toFormat] the date to format, default to current date
 * @return {string} the formatted date
 */
exports.formatServerDate = (toFormat) => {
    if (!toFormat) {
        toFormat = new Date();
    }

    const date = toFormat.toLocaleDateString(SERVER_DATE_FORMAT, SERVER_DATE_OPTIONS);
    const time = toFormat.toLocaleTimeString(SERVER_DATE_FORMAT, SERVER_DATE_OPTIONS);

    return `on ${date} at ${time} UTC`;
};
