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
 * Format a given duration (in milliseconds) in the format HH:MM:SS
 *
 * @param {number} duration the duration to format (in milliseconds)
 *
 * @return {string} the formatted duration
 */
export const formatDuration = (duration) => {
    const hours = Math.floor(duration / MILLISECONDS_IN_ONE_HOUR);
    const minutes = Math.floor(duration % MILLISECONDS_IN_ONE_HOUR / MILLISECONDS_IN_ONE_MINUTE);
    const seconds = Math.floor(duration % MILLISECONDS_IN_ONE_MINUTE / MILLISECONDS_IN_ONE_SECOND);

    // eslint-disable-next-line require-jsdoc
    const formatNumber = (number) => String(number).padStart(2, '0');

    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
};
