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
 * Returns the shift including the given timestamp
 *
 * /!\ SHIFT HOURS ARE BASED IN GENEVA TIMEZONE /!\
 *
 * Shift periods are:
 * [23,  7) => Night
 * [ 7, 15) => Morning
 * [15, 23) => Afternoon
 *
 * @param {number} timestamp the timestamp that must be included in the shift (UNIX timestamp in ms)
 * @return {Shift} the shift
 */
exports.getShiftFromTimestamp = (timestamp) => {
    // Timestamp is given in UTC, we apply an offset on it to manipulate timestamps expressed in the shifters timezone
    const date = new Date(timestamp);

    /*
     * The date is expressed in the shifter's timezone, we need to convert date to this timezone so we express date in a defined format
     * and parse it
     */
    const parseableDateFormat = 'fr-CH';
    const shifterTimezone = 'Europe/Zurich';
    // eslint-disable-next-line prefer-template
    const shifterLocaleDate = date.toLocaleDateString(parseableDateFormat, { timeZone: shifterTimezone })
        + ' ' + date.toLocaleTimeString(parseableDateFormat, { timeZone: shifterTimezone });

    // Get unix timestamp IN THE SHIFTERS TIMEZONE
    const FR_CH_DATETIME_REGEX = /([0-9]{2}).([0-9]{2}).([0-9]{4}) ([0-9]{2}:[0-9]{2}:[0-9]{2})/;
    const shifterLocalTimestamp = new Date(shifterLocaleDate.replace(FR_CH_DATETIME_REGEX, '$3-$2-$1T$4Z'))
        .getTime();

    // Offset to subtract to shifter local timestamp to get back to UTC timezone
    const shifterToUTCOffset = shifterLocalTimestamp - timestamp;

    // To mimic shifts that would occur at hours easy to handle (0, 8 and 16 hour), shift again the timestamp by 1 hour
    const timeOffset = 3600 * 1000;
    const shiftedShifterLocalTimestamp = shifterLocalTimestamp + timeOffset;

    // Duration of a shift in milliseconds
    const shiftDuration = 8 * 3600 * 1000;

    // Index of the SHIFTED shift, since the 1st of January 1970 at 00:00 (expressed in shifter's timezone)
    const shiftIndex = Math.floor(shiftedShifterLocalTimestamp / shiftDuration);

    // Timestamp of the shift start in the shifter's timezone WITH OFFSET
    const shiftedShiftStart = shiftIndex * shiftDuration;

    return {
        start: shiftedShiftStart - timeOffset - shifterToUTCOffset,
        // One shift lasts for 8 hours
        end: shiftedShiftStart - timeOffset - shifterToUTCOffset + shiftDuration,
        // Shifted shifts: [0 <-Night-> [8 <-Morning-> [16 <-Afternoon-> [0
        period: ['Night', 'Morning', 'Afternoon'][Math.floor(shiftIndex % 3)],
    };
};
