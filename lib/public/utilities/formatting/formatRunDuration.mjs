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
import { formatDuration } from './formatDuration.mjs';
import { MAX_RUN_DURATION } from '../../services/run/constants.mjs';

/**
 * Format the given run's duration
 *
 * @param {Run} run the run for which duration must be formatted
 * @return {string} the formatted run's duration
 */
export const formatRunDuration = (run) => {
    const { runDuration, timeTrgStart, timeTrgEnd, timeO2Start, timeO2End } = run;

    if (runDuration === null || runDuration === undefined) {
        return '-';
    }

    if (timeTrgEnd || timeO2End) {
        return formatDuration(runDuration);
    }

    const timeStart = timeTrgStart === null || timeTrgStart === undefined ? timeO2Start : timeTrgStart;

    // If trigger start is more than 48 hours ago, consider that AliECS crashed without ending the run
    if (Date.now() - timeStart > MAX_RUN_DURATION) {
        return 'UNKNOWN';
    }

    return 'RUNNING';
};
