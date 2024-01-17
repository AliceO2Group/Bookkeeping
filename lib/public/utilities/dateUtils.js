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

export const MILLISECONDS_IN_ONE_DAY = 24 * 60 * 60 * 1000;
const MILLISECONDS_IN_ONE_WEEK = 7 * MILLISECONDS_IN_ONE_DAY;

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

/**
 * Returns the date corresponding to the start of the given day (if null, start of today)
 *
 * @param {number} [day] the day for which the start date should be returned (between 1 and 31)
 * @param {number} [month] the month for which the day's start date should be returned (between 1 and 12, default to current month)
 * @param {number} [year] the year for which the day's start date should be returned (default to current year)
 * @return {Date} date representing the start of the given day
 */
export const getStartOfDay = (day, month, year) => {
    const now = new Date();
    if (year === undefined) {
        year = now.getFullYear();
    }

    if (month === undefined) {
        month = now.getMonth() + 1;
    }

    if (day === undefined) {
        day = now.getDate();
    }

    const startOfMonth = new Date(now.getTime());
    startOfMonth.setUTCHours(0, 0, 0, 0);
    startOfMonth.setUTCFullYear(year, month - 1, day);

    return startOfMonth;
};

/**
 * Returns the date corresponding to the start of the given month (if null, start of the current month)
 *
 * @param {number} [month] the month for which the start date should be returned (between 1 and 12)
 * @param {number} [year] the year for which the month's start date should be returned (default to current year)
 * @return {Date} date representing the start of the given month
 */
export const getStartOfMonth = (month, year) => getStartOfDay(1, month, year);

/**
 * Return the date corresponding to the start of the given year (if null, start of the current year)
 *
 * @param {number} [year] the year for which the start date should be returned
 * @return {Date} date representing the start of the given year
 */
export const getStartOfYear = (year) => getStartOfMonth(1, year);

/**
 * Returns the amount of weeks in the given year
 *
 * @param {number} [year] the year from which weeks count must be returned
 * @return {number} the amount of weeks
 */
export const getWeeksCount = (year) => {
    const now = new Date();
    if (year === undefined) {
        year = now.getFullYear();
    }

    // A year can have either 52 or 53 weeks
    const startOf53rdWeek = getStartOfWeek(53, year);
    return startOf53rdWeek.getUTCFullYear() === year ? 53 : 52;
};

/**
 * Return the date corresponding to the start of the given year's week (if null, uses the current week and year)
 *
 * @param {number} [week] the week for which the start date should be returned
 * @param {number} [year] optionally the year from which week's starting date must be computed
 * @return {Date} date representing the start of the given week
 */
export const getStartOfWeek = (week, year) => {
    const now = new Date();
    if (year === undefined) {
        year = now.getFullYear();
    }

    const startOfYear = getStartOfYear(year);
    // 0 is Sunday, but we want it to be Monday, so cycle every indices by -1 (add 7 before removing 1 then modulo 7 to avoid negatives)
    const weekDay = (startOfYear.getDay() + 6) % 7;

    /*
     * Week 1 of the year is the first week that includes the **first Thursday of the year**.
     *
     * In order to find the week in question, we first try to find the first Thursday. To do so, we first look at the week that includes the
     * first day of the week:
     * - If the thursday is before the first day of the year, first week is the next one
     * - else, it is the first week of the year
     *
     * We know that the Thursday is day 3. To get its offset compared to the first day of the year, we simply subtract the indices. For example:
     *  - If year start on Monday, Thursday is (3 - 0) => 3 days after (offset 3)
     *  - If year start on Thursday, Thursday is (0 - 0) => the same day (offset 0)
     *  - If year start on Saturday, Thursday is (3 - 5) => 2 days before (offset -2)
     *
     * It appears that if the result is negative, the first week will be the one that includes the next thursday. Using modulo calculation, we
     * can consider that the Thursday we are looking for is `(3 - weekDay + 7) % 7` days after the first day of the year (negative value will be
     * incremented by 7, so next week)
     *
     * In the end what we want is the monday that precedes this Thursday, so we take 3 days before
     */
    const firstThursdayOfYearOffset = (10 - weekDay) % 7;
    const startOfFirstWeek = new Date(startOfYear.getTime() + (firstThursdayOfYearOffset - 3) * MILLISECONDS_IN_ONE_DAY);
    const startOfFirstWeekTimestamp = startOfFirstWeek.getTime();

    if (week === undefined) {
        const startOfTodayTimestamp = getStartOfDay().getTime();

        // We are in the end of last year's last week, that overlap with the current year
        if (startOfFirstWeekTimestamp > startOfTodayTimestamp) {
            return new Date(startOfFirstWeekTimestamp - MILLISECONDS_IN_ONE_WEEK);
        }

        week = Math.floor(startOfTodayTimestamp - startOfFirstWeekTimestamp) + 1;
    }

    return new Date(startOfFirstWeekTimestamp + (week - 1) * MILLISECONDS_IN_ONE_WEEK);
};

export const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
