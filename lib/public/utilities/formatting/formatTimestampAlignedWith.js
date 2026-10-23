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

import { h } from '/js/src/index.js';
import { formatTimestamp } from './formatTimestamp.js';
import { userPreferencesStore } from '../userPreferencesStore.js';
import { getLocaleDateAndTime, getLocaleDateAndTimeWithMilliseconds } from '../dateUtils.mjs';

/**
 * Format the given timestamp inline, hiding its date, but keeping its space, if it is the same day as a reference timestamp, so that when
 * displayed below the formatted reference, the times are aligned and a different day is visible. Raw timestamps are displayed as is
 *
 * @param {number|null} timestamp the timestamp to format (in milliseconds)
 * @param {number|null} [referenceTimestamp] the timestamp to compare the day to
 * @param {boolean} [displayMilliseconds] if true, the time will include milliseconds
 * @return {Component|string} the formatted timestamp
 */
export const formatTimestampAlignedWith = (timestamp, referenceTimestamp, displayMilliseconds = false) => {
    if (timestamp && referenceTimestamp && !userPreferencesStore.rawTimestamps) {
        const getDateAndTime = displayMilliseconds ? getLocaleDateAndTimeWithMilliseconds : getLocaleDateAndTime;
        const { date, time } = getDateAndTime(timestamp);
        if (date === getLocaleDateAndTime(referenceTimestamp).date) {
            return h('span', [h('span.invisible', `${date}, `), time]);
        }
    }
    return formatTimestamp(timestamp, true, displayMilliseconds);
};
