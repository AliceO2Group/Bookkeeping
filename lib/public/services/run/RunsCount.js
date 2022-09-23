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

import { incrementIndexedCounters } from '../../utilities/statistics/incrementIndexedCounters.js';

/**
 * Service class used to count runs over different criteria
 */
export class RunsCount {
    /**
     * Constructor
     */
    constructor() {
        this._total = 0;
        this._perDetectors = new Map();
        this._perQuality = new Map();
        this._durations = [];
    }

    /**
     * Update the counters by adding a new run
     *
     * @param {Run} run the run to add
     * @return {void}
     */
    addRun(run) {
        const { detectors, runQuality, runDuration } = run;
        for (const detector of detectors.split(',')) {
            const detectorKey = detector.trim();
            incrementIndexedCounters(detectorKey, this._perDetectors);
        }

        const qualityKey = runQuality.trim();
        incrementIndexedCounters(qualityKey, this._perQuality);

        this._total++;
        this._durations.push(runDuration);
    }

    /**
     * Returns the amount of runs that are above the given limit
     *
     * @param {number} limit the limit
     * @return {number} the amount
     */
    overLimit(limit) {
        return this._durations.filter((duration) => duration > limit).length;
    }

    /**
     * Returns the amount of runs that are under the given limit
     *
     * @param {number} limit the limit
     * @return {number} the amount
     */
    underLimit(limit) {
        return this._durations.length - this.overLimit(limit);
    }

    /**
     * Returns the total amount of runs
     *
     * @return {number} the amount
     */
    get total() {
        return this._total;
    }

    /**
     * Returns a map with the detector name as key and the amount of runs including this detector as value
     *
     * @return {Map<string, number>} the map
     */
    get perDetectors() {
        return this._perDetectors;
    }

    /**
     * Returns a map with the quality as key and the amount of runs wit this quality as value
     *
     * @return {Map<string, number>} the map
     */
    get perQuality() {
        return this._perQuality;
    }
}
