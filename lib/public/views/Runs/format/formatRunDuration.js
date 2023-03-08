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

import { formatDuration } from '../../../utilities/formatting/formatDuration.js';
import { h, iconWarning } from '/js/src/index.js';
import { MAX_RUN_DURATION } from '../../../services/run/constants.js';
import { popover } from '../../../components/common/popover/popover.js';

/**
 * Format the duration of a given run
 *
 * @param {Object} run for which duration must be displayed
 * @param {boolean} raw if true, the output will be plain text, else if will be formatted as hyperscript vnode
 *
 * @return {string|vnode} the formatted duration
 */
export const formatRunDuration = (run, raw = false) => {
    const { runDuration, timeTrgStart, timeTrgEnd, timeO2Start, timeO2End } = run;
    if (runDuration === null || runDuration === undefined) {
        return '-';
    }

    const missingTimeTrgStart = timeTrgStart === null || timeTrgStart === undefined;
    const missingTimeTrgEnd = timeTrgEnd === null || timeTrgEnd === undefined;

    if (timeTrgEnd || timeO2End) {
        let warningPopover = null;

        if (missingTimeTrgStart && missingTimeTrgEnd) {
            warningPopover = 'Duration based on o2 start AND stop because of missing trigger information';
        } else if (missingTimeTrgStart) {
            warningPopover = 'Duration based on o2 start because of missing trigger start information';
        } else if (missingTimeTrgEnd) {
            warningPopover = 'Duration based on o2 stop because of missing trigger end information';
        }

        return raw
            ? formatDuration(runDuration)
            : h(
                '.flex-row.g2.justify-center.items-center.flex-wrap',
                [formatDuration(runDuration), warningPopover && popover(iconWarning(), warningPopover)],
            );
    }

    const timeStart = missingTimeTrgStart ? timeO2Start : timeTrgStart;

    let ret = {
        text: 'RUNNING',
        classes: 'success',
    };

    // If trigger start is more than 48 hours ago, consider that AliECS crashed without ending the run
    if (Date.now() - timeStart > MAX_RUN_DURATION) {
        ret = {
            text: 'UNKNOWN',
            classes: 'danger',
        };
    }

    if (raw) {
        return ret.text;
    }

    return h(`strong.${ret.classes}`, ret.text);
};
