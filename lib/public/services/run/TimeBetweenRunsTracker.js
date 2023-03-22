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
 * Tracker to compute time elapsed between runs
 */
export class TimeBetweenRunsTracker {
    /**
     * Constructor
     */
    constructor() {
        this._previousEnd = undefined;
        this._total = 0;
        this._totalIsUnderEvaluated = false;
    }

    /**
     * Update the given run to define the time elapsed between its start and the previous run's start. If there is no previous run, elapsed time
     * is undefined. If the previous run did not have a stop time or the current run do not have a start time, elapsed time is null
     *
     * @param {Run} run the run to track
     * @return {number} the elapsed time since previous run
     */
    trackRun(run) {
        let elapsed;

        const { startTime, endTime, runDuration } = run;
        if (startTime === null || this._previousEnd === null) {
            elapsed = null;
            // There is a missing edge
            this._totalIsUnderEvaluated = true;
        } else if (this._previousEnd !== undefined) {
            elapsed = Math.max(0, startTime - this._previousEnd);
        }

        run.timeSincePreviousRun = elapsed;

        // If end time has been extrapolated, we drop it
        this._previousEnd = runDuration < MAX_RUN_DURATION ? endTime : null;
        if (elapsed) {
            this._total += elapsed;
        }
        return elapsed;
    }

    /**
     * Return the total elapsed time between runs (in milliseconds)
     *
     * @return {number} th elapsed time
     */
    get total() {
        return this._total;
    }

    /**
     * States if at least one of the tracked runs had a missing edge, which means that the total elapsed time between run is
     * under-estimated
     *
     * @return {boolean} true if the total is underestimated
     */
    get totalIsUnderEvaluated() {
        return this._totalIsUnderEvaluated;
    }
}
