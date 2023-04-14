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

const { SERVER_DATE_FORMAT } = require('../../utilities/formatServerDate.js');
const { SHIFTER_TIMEZONE } = require('./getShiftFromTimestamp.js');

/**
 * Format a date in a timezone and format that makes sense in a shift context
 *
 * @param {number|Date} toFormat the date to format
 * @return {string} the formatted date
 */
exports.formatShiftDate = (toFormat) => {
    if (!(toFormat instanceof Date)) {
        toFormat = new Date(toFormat);
    }

    const date = toFormat.toLocaleDateString(SERVER_DATE_FORMAT, { timeZone: SHIFTER_TIMEZONE });
    const time = toFormat.toLocaleTimeString(SERVER_DATE_FORMAT, { timeZone: SHIFTER_TIMEZONE });

    return `${date}, ${time}`;
};
