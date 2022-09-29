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

import { formatDuration } from '../../utilities/formatting/formatDuration.js';
import { h } from '/js/src/index.js';

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
    } else if (timeTrgEnd || timeO2End) {
        return `${formatDuration(runDuration)}${raw ? '' : getAsteriks(run)}`;
    } else {
        const timeStart = timeTrgStart === null || timeTrgStart === undefined
            ? timeO2Start
            : timeTrgStart;
        let ret = {
            text: 'RUNNING',
            classes: 'success',
        };

        // If trigger start is more than 48 hours ago, consider that AliECS crashed without ending the run
        if (Date.now() - timeStart > 1000 * 60 * 60 * 48) {
            ret = {
                text: 'UNKNOWN',
                classes: 'danger',
            };
        }

        if (raw) {
            return ret.text;
        }

        return h(`strong.${ret.classes}`, ret.text);
    }
};

/**
 * Compares the given values and checks how many asteriks needs to be given to the duration.
 * @param {Run} run the current run object.
 * @returns {String} one/two asteriks or an empty string
 */
const getAsteriks = (run) => {
    const { timeO2Start, timeO2End, timeTrgEnd, timeTrgStart } = run;
    if (timeTrgStart) {
        if (timeTrgEnd) {
            return '';
        }
        if (timeO2End) {
            return '**';
        }
    }
    if (timeO2Start) {
        if (timeTrgEnd) {
            return '**';
        }
        if (timeO2End) {
            return '*';
        }
    }
    return '';
};
