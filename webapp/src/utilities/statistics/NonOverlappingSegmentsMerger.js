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
 * @property {number} start the start of the segment
 * @property {number} end the end of the segment
 */

/**
 * Class handling the merge of segment to obtain a list of non-overlapping segments
 */
export class NonOverlappingSegmentsMerger {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {Segment[]}
         */
        this._segments = [];
    }

    /**
     * Merge a segment to the existing ones, avoiding overlap
     *
     * @param {Segment} segment the segment to merge
     * @return {void}
     */
    merge({ start, end }) {
        /**
         * Flag set to true when a raw segment has either been merged into a previous pure one or inserted as a new pure segment
         * @type {boolean}
         */
        let segmentMerged = false;

        for (/** @type {number} */ const segmentIndex in this._segments) {
            // Check if current pure segment and raw segment overlap
            const segment = this._segments[segmentIndex];

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
                        this._segments[segmentIndex - 1].end = segment.end;
                        this._segments.splice(segmentIndex, 1);
                        // Merging has ended
                        break;
                    } else {
                        // Raw segments continues after the current pure segment and may overlap another one
                        this._segments[segmentIndex - 1].end = end;
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
                    this._segments.splice(segmentIndex, 0, { start, end });
                    segmentMerged = true;
                    break;
                }
            }
        }
        if (!segmentMerged) {
            // Raw segment is after any existing pure segment, insert it as a new pure segment
            this._segments.push({ start, end });
        }
    }

    /**
     * Returns the list of non-overlapping merged segments
     *
     * @return {Segment[]} the merged segments
     */
    get segments() {
        return this._segments;
    }

    /**
     * Returns the cumulative length of all the non overlapping segments
     *
     * @return {number} the length
     */
    get totalLength() {
        return this._segments.reduce((duration, segment) => duration + segment.end - segment.start, 0);
    }
}
