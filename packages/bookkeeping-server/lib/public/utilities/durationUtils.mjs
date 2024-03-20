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

const MILLISECONDS_IN_ONE_SECOND = 1000;

const MILLISECONDS_IN_ONE_MINUTE = 60 * MILLISECONDS_IN_ONE_SECOND;

const MILLISECONDS_IN_ONE_HOUR = 60 * MILLISECONDS_IN_ONE_MINUTE;

/**
 * Returns the amount of hours, minutes and seconds contained in a given duration
 *
 * @param {number} duration the duration to split (in milliseconds)
 *
 * @return {{hours: number, seconds: number, minutes: number}} the amount of hours, minutes and seconds
 */
export const splitDuration = (duration) => {
    const hours = Math.floor(duration / MILLISECONDS_IN_ONE_HOUR);
    const minutes = Math.floor(duration % MILLISECONDS_IN_ONE_HOUR / MILLISECONDS_IN_ONE_MINUTE);
    const seconds = Math.floor(duration % MILLISECONDS_IN_ONE_MINUTE / MILLISECONDS_IN_ONE_SECOND);

    return { hours, minutes, seconds };
};

/**
 * Returns the total duration composed by a given amount of hours, minutes and seconds
 *
 * @param {number} hours the amount of hours
 * @param {minutes} minutes the amount of minutes
 * @param {seconds} seconds the amount of seconds
 *
 * @return {number} the total duration (in milliseconds)
 */
export const mergeDuration = ({
    hours,
    minutes,
    seconds,
}) => MILLISECONDS_IN_ONE_HOUR * (hours || 0) + MILLISECONDS_IN_ONE_MINUTE * (minutes || 0) + MILLISECONDS_IN_ONE_SECOND * (seconds || 0);
