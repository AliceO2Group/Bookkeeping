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
import { getLocaleDateAndTimeWithMilliseconds } from '../../../utilities/dateUtils.mjs';

/**
 * Format QC flag timestamp with de-emphasized date and emphasized milliseconds.
 *
 * @param {number} timestamp timestamp to format
 * @param {boolean} [inline=false] if true, the date and time will be returned as a string. Else, a component will be returned 
 * with date and time being separated by a newline
 * @return {Component} formatted timestamp
 */
export const formatQcFlagTimestamp = (timestamp, inline = false) => {
    const { date, time } = getLocaleDateAndTimeWithMilliseconds(timestamp);
    const [, wholeSeconds, milliseconds] = time.match(/^(.*)(\.\d{3})$/);

    if (inline) {
        return `${date}, ${wholeSeconds}${milliseconds}`;
    }
    return h('', [h('.gray-darker', `${date}, `), wholeSeconds, h('strong', milliseconds)]);
};
