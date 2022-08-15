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

/**
 * @typedef Segment
 * @property {number} start the segment start
 * @property {number} end the segment end
 */

import { isPotentiallyPhysicsRun } from '../run/isPotentiallyPhysicsRun.js';

/**
 * Considering the given list of segments ([start, end] couple of values, with end > start), return a list of segments covering the exact same
 * ranges but without overlapping
 *
 * @param {Segment[]} overlappingTimeSegments the list of potentially overlapping segments
 *
 * @return {Segment[]} the not overlapping segments
 */
function mergeOverlappingSegments(overlappingTimeSegments) {
    return overlappingTimeSegments.reduce((accumulator, { start, end }) => {
        /**
         * Flag set to true when a raw segment has either been merged into a previous pure one or inserted as a new pure segment
         * @type {boolean}
         */
        let segmentMerged = false;
        for (const segmentIndex in accumulator) {
            // Check if current pure segment and raw segment overlap
            const segment = accumulator[segmentIndex];

            if (end >= segment.start && segment.end >= start) {
                if (segmentMerged) {
                    /*
                     * We are in the case where the raw segment has been merged in the previous pure segment, which means that the previous pure
                     * segment now overlap with the current one:
                     *
                     * |-- segment 1 --|     |-- segment 2 --|
                     *           runMerged    |-- raw -- |
                     *
                     * Has become
                     *
                     * |------ segment 1 -------|
                     *                       |-- segment 2 --|
                     *
                     * In this case, we include segment 2 in segment 1 and make obsolete segment 2
                     */
                    if (segment.end >= end) {
                        // Current pure segment is the last one that may overlap
                        accumulator[segmentIndex - 1].end = segment.end;
                        accumulator.splice(segmentIndex, 1);
                        // Merging has ended
                        break;
                    } else {
                        // Raw segments continues after the current pure segment and may overlap another one
                        accumulator[segmentIndex - 1].end = end;
                        segment.end = -1;
                        segment.start = -1;
                    }
                } else {
                    // Overlap, merge raw segment into current pure one
                    segment.start = Math.min(segment.start, start);
                    segment.end = Math.max(segment.end, end);

                    segmentMerged = true;
                }
            } else {
                // No overlap
                if (!segmentMerged && end < segment.start) {
                    // Raw segment is strictly before the current segment, then no segments will ever overlap (ascending order by construction)
                    accumulator.splice(segmentIndex, 0, { start, end });
                    segmentMerged = true;
                    break;
                }
            }
        }
        if (!segmentMerged) {
            // Raw segment is after any existing pure segment, insert it as a new pure segment
            accumulator.push({ start, end });
        }

        return accumulator;
    }, []);
}

/**
 * Compute and return LHC fill
 *
 * @param {object[]} runs the list of runs attached to the fill
 * @param {number} stableBeamsDuration the duration of the stable beams (in milliseconds)
 * @param {number} stableBeamsStart the timestamp (in milliseconds) of the stable beams start
 * @param {number} stableBeamsEnd the timestamp (in milliseconds) of the stable beams end
 *
 * @return {{efficiency: number, efficiencyLossAtStart: number, meanRunDuration: number, totalRunsDuration: number}} the LHC fill statistics
 */
export const computeLhcFillStatistics = (runs, stableBeamsDuration, stableBeamsStart, stableBeamsEnd) => {
    // Reduce runs to not overlapping time segments sorted by start time
    const overlappingTimeSegments = [];
    for (const run of runs) {
        const { runQuality, timeO2Start, timeO2End, timeTrgStart, timeTrgEnd } = run;
        const runStart = timeTrgStart !== null ? timeTrgStart : timeO2Start;
        const runEnd = timeTrgEnd !== null ? timeTrgEnd : timeO2End;

        const start = Math.min(Math.max(runStart, stableBeamsStart), runEnd);
        const end = Math.max(Math.min(runEnd, stableBeamsEnd), runStart);

        if (!(runQuality === 'good' && isPotentiallyPhysicsRun(run)) || end - start < 0 || !stableBeamsDuration) {
            continue;
        }

        overlappingTimeSegments.push({ start, end });
    }

    /*
     * Reduce time segments by merging any overlap to have disjoint time segments list
     * Source segments (potentially overlapping) are called raw segments, disjoint ones are called pure segments
     */
    const coveredTimeSegments = mergeOverlappingSegments(overlappingTimeSegments);
    const runsCoverage = coveredTimeSegments.reduce((duration, segment) => duration + segment.end - segment.start, 0);
    const firstRunStartOrFillEnd = coveredTimeSegments.length > 0 ? coveredTimeSegments[0].start : stableBeamsStart + stableBeamsDuration;
    const durationBeforeFirstRun = coveredTimeSegments.length > 0 ? coveredTimeSegments[0].start - stableBeamsStart : null;
    const efficiencyLossAtStart = (firstRunStartOrFillEnd - stableBeamsStart) / stableBeamsDuration * 100;

    const totalRunsDuration = overlappingTimeSegments.reduce((sum, segment) => sum + segment.end - segment.start, 0);

    return {
        efficiency: runsCoverage / stableBeamsDuration * 100,
        efficiencyLossAtStart,
        durationBeforeFirstRun,
        meanRunDuration: totalRunsDuration / overlappingTimeSegments.length,
        totalRunsDuration,
    };
};
