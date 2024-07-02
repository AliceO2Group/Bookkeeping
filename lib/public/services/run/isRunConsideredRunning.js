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

import { MAX_RUN_DURATION } from './constants.mjs';

/**
 * Sates whether the run is running
 *
 * @param {Run} run the run
 * @return {boolean} true if the run is running, false if it's not or cannot tell
 */
export const isRunConsideredRunning = (run) => {
    const { runDuration, timeTrgEnd, timeO2End } = run;
    return (timeTrgEnd ?? timeO2End ?? null) === null && runDuration < MAX_RUN_DURATION;
};
