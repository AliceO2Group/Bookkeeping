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
import { MAX_RUN_DURATION } from '../../services/run/constants.mjs';

/**
 * Sates whether the run is running
 *
 * @param {Run} run the run
 * @return {boolean|null} true if the run is running, false if it's not, null if it's not running but not certainly
 */
export const isRunRunning = (run) => {
    const { runDuration, timeTrgStart, timeTrgEnd, timeO2Start, timeO2End } = run;

    if (runDuration === null || runDuration === undefined) {
        return null;
    }

    if (timeTrgEnd || timeO2End) {
        return false;
    }

    const timeStart = timeTrgStart === null || timeTrgStart === undefined ? timeO2Start : timeTrgStart;

    // If trigger start is more than 48 hours ago, consider that AliECS crashed without ending the run
    if (Date.now() - timeStart > MAX_RUN_DURATION) {
        return null;
    }

    return true;
};
