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

/**
 * Format the duration of a given run
 *
 * @param {Object} run for which duration must be displayed
 * @param {boolean} raw if true, the output will be plain text, else if will be formatted as hyperscript vnode
 *
 * @return {string|vnode} the formatted duration
 */
export const formatRunDuration = ({ runDuration, timeTrgEnd }, raw = false) => {
    if (runDuration === null || runDuration === undefined) {
        return '-';
    } else if (timeTrgEnd) {
        return `${Math.floor(runDuration / 60000)} min`;
    } else {
        const runningText = 'RUNNING';

        if (raw) {
            return runningText;
        }

        return h('strong.success', runningText);
    }
};
