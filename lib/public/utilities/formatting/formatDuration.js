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
import { splitDuration } from '../durationUtils.js';

/**
 * Format a given duration (in milliseconds) in the format HH:MM:SS
 *
 * @param {number} duration the duration to format (in milliseconds)
 *
 * @return {string} the formatted duration
 */
export const formatDuration = (duration) => {
    if (duration !== 0 && !duration) {
        return '-';
    }

    const { hours, minutes, seconds } = splitDuration(duration);

    // eslint-disable-next-line require-jsdoc
    const formatNumber = (number) => String(number).padStart(2, '0');

    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
};
