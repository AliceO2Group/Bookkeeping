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

const LOCALE_FORMAT = 'en-GB';
const DATE_STYLE = 'short';
const TIME_STYLE = 'medium';

/**
 * Format the given timestamp in the common format, i.e. en-GB locale with short date and medium time
 *
 * @param {number|null} timestamp the timestamp to format (in milliseconds)
 * @param {boolean} [inline] if true, the date and time will be returned as a string. Else, a component will be returned and date and time are
 *     separated by a newline
 *
 * @return {vnode|string} the formatted timestamp
 */
export const formatTimestamp = (timestamp, inline = true) => {
    if (!timestamp) {
        return '-';
    }

    const date = new Date(timestamp);

    if (inline) {
        return date.toLocaleString(LOCALE_FORMAT, { dateStyle: DATE_STYLE, timeStyle: TIME_STYLE });
    }

    return h('', [
        date.toLocaleDateString(LOCALE_FORMAT, { dateStyle: DATE_STYLE }),
        h('br'),
        date.toLocaleTimeString(LOCALE_FORMAT, { timeStyle: TIME_STYLE }),
    ]);
};
