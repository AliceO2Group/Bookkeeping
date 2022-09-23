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
import { NonOverlappingSegmentsMerger } from '../../utilities/statistics/NonOverlappingSegmentsMerger.js';
import { getRunStartAndEnd } from '../run/getRunStartAndEnd.js';

/**
 * @typedef LhcFillStatistics
 *
 * @property {number} efficiency
 * @property {number} durationBeforeFirstRun duration between the start of the fill and the start of the first run
 * @property {number} efficiencyLossAtStart percentage of duration not covered by any run at the start of fill compared to the global fill
 *     duration
 * @property {number} durationAfterLastRun duration between the end of the last run and the end of the fill
 * @property {number} efficiencyLossAtEnd percentage of duration not covered by any run at the end of fill compared to the global fill duration
 * @property {number} meanRunDuration mean of the runs duration
 * @property {number} runsCoverage total duration covered by at least one run
 */

/**
 * Service used to compute LHC fill statistics
 */
export class LhcFillStatisticsExtractor {
    /**
     * Constructor
     *
     * @param {LhcFill} lhcFill the lhc fill for which statistics must be computed
     * @param {Run[]} [runs=[]] the list of runs to consider to compute statistics (only physics run will be added). This is optional and runs
     *     can be added independently later on using {@see addRun}, for performances purpose
     */
    constructor({ stableBeamsStart, stableBeamsEnd, stableBeamsDuration }, runs = []) {
        this._stableBeamsStart = stableBeamsStart;
        this._stableBeamsEnd = stableBeamsEnd;
        // Stable beam duration is in seconds in LHC fill
        this._stableBeamsDuration = stableBeamsDuration * 1000;

        this._timeSegmentsMerger = new NonOverlappingSegmentsMerger();
        this._rawTimeSegments = [];

        for (const run of runs) {
            this.addRun(run);
        }
    }

    /**
     * Add a run to the list of runs to consider to compute statistics
     *
     * The run is rejected if :
     *     - It does not overlap with the fill
     *     - It does not have a good quality
     *     - the fill do not have stable beam duration
     *
     * @param {Run} run the run to add
     * @return {void}
     */
    addRun(run) {
        const { runQuality } = run;
        const { start: runStart, end: runEnd } = getRunStartAndEnd(run);

        // If the run do not overlap with LHC fill at all or is not well-defined, do not consider it
        if (
            !this._stableBeamsDuration
            || runStart === null
            || runEnd === null
            || runEnd < this._stableBeamsStart
            || runStart > this._stableBeamsEnd
        ) {
            return;
        }

        const start = Math.max(runStart, this._stableBeamsStart);
        const end = Math.min(runEnd, this._stableBeamsEnd);

        if (runQuality !== 'good' || end - start < 0) {
            return;
        }

        this._timeSegmentsMerger.merge({ start, end });
        this._rawTimeSegments.push({ start, end });
    }

    /**
     * Returns the computed LHC fill statistics
     *
     * @return {LhcFillStatistics} the extracted statistics
     */
    get statistics() {
        const coveredTimeSegments = this._timeSegmentsMerger.segments;
        const runsCoverage = coveredTimeSegments.reduce((duration, segment) => duration + segment.end - segment.start, 0);

        let firstSegment = null;
        let lastSegment = null;
        if (coveredTimeSegments.length > 0) {
            [firstSegment] = coveredTimeSegments;
            [lastSegment] = coveredTimeSegments.slice(-1);
        }
        const firstRunStartOrFillEnd = firstSegment ? firstSegment.start : this._stableBeamsStart + this._stableBeamsDuration;
        const durationBeforeFirstRun = firstSegment ? firstSegment.start - this._stableBeamsStart : null;
        const efficiencyLossAtStart = (firstRunStartOrFillEnd - this._stableBeamsStart) / this._stableBeamsDuration * 100;

        const lastRunEndOrFillStart = lastSegment ? lastSegment.end : this._stableBeamsStart;
        const durationAfterLastRun = lastSegment ? this._stableBeamsStart + this._stableBeamsDuration - lastSegment.end : null;
        const efficiencyLossAtEnd =
            (this._stableBeamsStart + this._stableBeamsDuration - lastRunEndOrFillStart) / this._stableBeamsDuration * 100;

        const totalRunsDuration = this._rawTimeSegments.reduce((sum, segment) => sum + segment.end - segment.start, 0);

        return {
            efficiency: runsCoverage / this._stableBeamsDuration * 100,
            durationBeforeFirstRun,
            efficiencyLossAtStart,
            durationAfterLastRun,
            efficiencyLossAtEnd,
            meanRunDuration: totalRunsDuration / this._rawTimeSegments.length,
            runsCoverage,
        };
    }
}
