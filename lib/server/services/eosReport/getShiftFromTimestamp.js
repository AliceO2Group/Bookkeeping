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
 * [23,  7[ => Night
 * [ 7, 15[ => Morning
 * [15, 23[ => Afternoon
 *
 * @param {number} timestamp the timestamp that must be included in the shift (UNIX timestamp in ms)
 * @return {Shift} the shift
 */
exports.getShiftFromTimestamp = (timestamp) => {
    // Timestamp is given in UTC, we apply an offset on it to manipulate timestamps expressed in the shifters timezone
    const date = new Date(timestamp);
    // The date expressed in the shifter's timezone
    const shifterLocaleDate = date.toLocaleString('fr-CH', { timeZone: 'Europe/Zurich' });

    // Get unix timestamp IN THE SHIFTERS TIMEZONE
    const FR_CH_DATETIME_REGEX = /([0-9]{2}).([0-9]{2}).([0-9]{4}) ([0-9]{2}:[0-9]{2}:[0-9]{2})/;
    const shifterLocalTimestamp = new Date(shifterLocaleDate.replace(FR_CH_DATETIME_REGEX, '$3-$2-$1T$4Z'))
        .getTime();

    // Offset to subtract to shifter local timestamp to get back to UTC timezone
    const shifterToUTCOffset = shifterLocalTimestamp - timestamp;

    // To mimic shifts that would occur at hours easy to handle (0, 8 and 16 hour), shift again the timestamp by 1 hour
    const timeOffset = 3600 * 1000;

    // Construct a date object representing the start of the shifted shift (i.e. 0, 8 or 16)
    const shiftedShiftStart = new Date(shifterLocalTimestamp + timeOffset);
    const shiftedShiftStartHour = shiftedShiftStart.getHours() - shiftedShiftStart.getHours() % 8;
    shiftedShiftStart.setHours(shiftedShiftStartHour, 0, 0, 0);

    return {
        start: shiftedShiftStart.getTime() - timeOffset - shifterToUTCOffset,
        // One shift lasts for 8 hours
        end: shiftedShiftStart.getTime() - timeOffset - shifterToUTCOffset + 8 * 3600 * 1000,
        // Shifted shifts: [0 <-Night-> [8 <-Morning-> [16 <-Afternoon-> [0
        period: ['Night', 'Morning', 'Afternoon'][Math.floor(shiftedShiftStartHour / 8)],
    };
};
