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
 * @typedef RunsStatistics
 * @property {Map<string, number>} perDetectors a map with the detector name as key and the amount of runs including this detector as value
 * @property {Map<string, number>} perQuality a map with the quality as key and the amount of runs wit this quality as value
 * @property {number} overLimit the amount of runs that are above the given limit
 * @property {number} underLimit the amount of runs that are under the given limit
 */

/**
 * Considering a map of counters indexed by keys, increment (and create if needed) the counter for the given index
 *
 * @template K
 *
 * @param {K} index the index of the counter to increment
 * @param {Map<K, number>} indexedCounters the indexed counters
 *
 * @return {void}
 */
const incrementIndexedCounters = (index, indexedCounters) => {
    if (!indexedCounters.has(index)) {
        indexedCounters.set(index, 0);
    }
    indexedCounters.set(index, indexedCounters.get(index) + 1);
};

/**
 * Extract statistics from a list of runs
 *
 * @param {Object[]} runs the list of runs from which statistics must be computed
 * @param {number} durationLimit the limit which need to be considered to compute overLimit and underLimit runs durations (in milliseconds)
 *
 * @return {RunsStatistics} the extracted statistics
 */
export const extractRunStatistics = (runs, durationLimit) => {
    const perDetectors = new Map();
    const perQuality = new Map();
    let overLimit = 0;

    for (const run of runs) {
        const { detectors, runQuality, runDuration } = run;
        for (const detector of detectors.split(',')) {
            const detectorKey = detector.trim();
            incrementIndexedCounters(detectorKey, perDetectors);
        }

        const qualityKey = runQuality.trim();
        incrementIndexedCounters(qualityKey, perQuality);

        if (runDuration > durationLimit) {
            overLimit++;
        }
    }

    return {
        total: runs.length,
        perDetectors,
        perQuality,
        overLimit,
        underLimit: runs.length - overLimit,
    };
};
