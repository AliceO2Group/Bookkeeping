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
 * @param {Object} options the format options
 * @param {boolean} [options.date=true] if true, the date of the shift will be displayed
 * @param {boolean} [options.time=true] if true, the time of the shift will be displayed
 * @return {string} the formatted date
 */
exports.formatShiftDate = (toFormat, { date, time } = { date: true, time: true }) => {
    if (!(toFormat instanceof Date)) {
        toFormat = new Date(toFormat);
    }

    const ret = [];

    if (date) {
        ret.push(toFormat.toLocaleDateString(SERVER_DATE_FORMAT, { timeZone: SHIFTER_TIMEZONE }));
    }

    if (time) {
        ret.push(toFormat.toLocaleTimeString(SERVER_DATE_FORMAT, { timeZone: SHIFTER_TIMEZONE }));
    }

    return ret.join(', ');
};
