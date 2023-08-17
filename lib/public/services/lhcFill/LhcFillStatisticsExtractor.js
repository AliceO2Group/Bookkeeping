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
import { MAX_RUN_DURATION } from '../run/constants.mjs';
import { RunQualities } from '../../domain/enums/RunQualities.js';

/**
 * Duration (in ms) after which one a run is considered as ended, and its end is considered as unknown
 *
 * @type {number}
 */

/**
 * Service used to compute LHC fill statistics
 */
export class LhcFillStatisticsExtractor {
    /**
     * Constructor
     *
     * @param {LhcFill} lhcFill the lhc fill for which statistics must be computed
     * @param {Run[]} [runs=[]] the list of runs to consider to compute statistics (only physics run will be added).
     *     This is optional and runs can be added independently later on using {@see addRun}, for performances purpose
     */
    constructor({ stableBeamsStart, stableBeamsEnd, stableBeamsDuration }, runs = []) {
        this._stableBeamsStart = stableBeamsStart;
        this._stableBeamsEnd = stableBeamsEnd;
        // Stable beam duration is in seconds in LHC fill
        this._stableBeamsDuration = stableBeamsDuration * 1000;

        this._globalTimeSegmentsMerger = new NonOverlappingSegmentsMerger();
        // Map between detectors and the merger used to compute per detector efficiency
        this._perDetetorsTimeSegmentsMergers = new Map();
        this._rawTimeSegments = [];

        this._totalCtfFileSize = 0;
        this._totalTfFileSize = 0;

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
        const { runQuality, detectors, startTime, endTime, ctfFileSize, tfFileSize } = run;

        // If the run do not overlap with LHC fill at all or is not well-defined, do not consider it
        if (
            !this._stableBeamsDuration
            || startTime === null
            || endTime === null
            // Drop runs that have uncertain duration
            || endTime - startTime > MAX_RUN_DURATION
            || endTime < this._stableBeamsStart
            || startTime > this._stableBeamsEnd
        ) {
            return;
        }

        const start = Math.max(startTime, this._stableBeamsStart);
        const end = Math.min(endTime, this._stableBeamsEnd);

        if (runQuality !== RunQualities.GOOD || end - start < 0) {
            return;
        }

        const segment = { start, end };
        this._globalTimeSegmentsMerger.merge(segment);
        for (const detector of (detectors || '').split(',')) {
            const key = detector.trim();
            if (!this._perDetetorsTimeSegmentsMergers.has(key)) {
                this._perDetetorsTimeSegmentsMergers.set(key, new NonOverlappingSegmentsMerger());
            }
            this._perDetetorsTimeSegmentsMergers.get(key).merge(segment);
        }
        this._rawTimeSegments.push({ start, end });

        const numericCtfFileSize = parseInt(ctfFileSize, 10);
        if (!isNaN(numericCtfFileSize)) {
            this._totalCtfFileSize += numericCtfFileSize;
        }

        const numericTfFileSize = parseInt(tfFileSize, 10);
        if (!isNaN(numericTfFileSize)) {
            this._totalTfFileSize += numericTfFileSize;
        }
    }

    /**
     * Returns the computed LHC fill statistics
     *
     * @return {LhcFillStatistics} the extracted statistics
     */
    get statistics() {
        const coveredTimeSegments = this._globalTimeSegmentsMerger.segments;
        const runsCoverage = this._globalTimeSegmentsMerger.totalLength;

        let firstSegment = null;
        let lastSegment = null;
        if (coveredTimeSegments.length > 0) {
            [firstSegment] = coveredTimeSegments;
            [lastSegment] = coveredTimeSegments.slice(-1);
        }
        const firstRunStartOrFillEnd = firstSegment
            ? firstSegment.start
            : this._stableBeamsStart + this._stableBeamsDuration;
        const timeLossAtStart = firstSegment ? firstSegment.start - this._stableBeamsStart : null;
        const efficiencyLossAtStart = (firstRunStartOrFillEnd - this._stableBeamsStart) / this._stableBeamsDuration * 100;

        const lastRunEndOrFillStart = lastSegment ? lastSegment.end : this._stableBeamsStart;
        const timeLossAtEnd = lastSegment
            ? this._stableBeamsStart + this._stableBeamsDuration - lastSegment.end
            : null;
        const efficiencyLossAtEnd =
            (this._stableBeamsStart + this._stableBeamsDuration - lastRunEndOrFillStart) / this._stableBeamsDuration * 100;

        const totalRunsDuration = this._rawTimeSegments.reduce((sum, segment) => sum + segment.end - segment.start, 0);

        // eslint-disable-next-line require-jsdoc
        const getEfficiencyFromCoverage = (coverage) => coverage / this._stableBeamsDuration * 100;
        const perDetectorsEfficiency = new Map();
        for (const [detector, merger] of this._perDetetorsTimeSegmentsMergers.entries()) {
            perDetectorsEfficiency.set(detector, getEfficiencyFromCoverage(merger.totalLength));
        }

        return {
            efficiency: getEfficiencyFromCoverage(runsCoverage),
            perDetectorsEfficiency,
            timeLossAtStart,
            efficiencyLossAtStart,
            timeLossAtEnd,
            efficiencyLossAtEnd,
            meanRunDuration: totalRunsDuration / this._rawTimeSegments.length,
            runsCoverage,
            totalCtfFileSize: this._totalCtfFileSize,
            totalTfFileSize: this._totalTfFileSize,
        };
    }
}
