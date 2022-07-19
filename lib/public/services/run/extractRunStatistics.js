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
            if (!perDetectors.has(detectorKey)) {
                perDetectors.set(detectorKey, 0);
            }
            perDetectors.set(detectorKey, perDetectors.get(detectorKey) + 1);
        }

        const qualityKey = runQuality.trim();
        if (!perQuality.has(qualityKey)) {
            perQuality.set(qualityKey, 0);
        }
        perQuality.set(qualityKey, perQuality.get(qualityKey) + 1);

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
