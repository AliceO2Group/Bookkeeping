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
 * Levels of efficiency of a LHC fill
 *
 * @enum {string}
 */
export const EfficiencyLevels = Object.freeze({
    GREAT: 'great',
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor',
    BAD: 'bad',
});

/**
 * Minimal efficiency (normalized between 0 and 1) of each level, from the best to the worst one. Below the last threshold, the level is bad
 */
export const EFFICIENCY_LEVELS_THRESHOLDS = Object.freeze([
    [EfficiencyLevels.GREAT, 0.95],
    [EfficiencyLevels.GOOD, 0.8],
    [EfficiencyLevels.FAIR, 0.7],
    [EfficiencyLevels.POOR, 0.5],
]);

/**
 * Returns the level of the given efficiency: great from 95%, good from 80%, fair from 70%, poor from 50%, else bad
 *
 * @param {number|null|undefined} efficiency the efficiency of the fill, normalized between 0 and 1
 * @return {EfficiencyLevels|null} the level, or null if the efficiency is unknown or null (no level is displayed for them)
 */
export const getEfficiencyLevel = (efficiency) => {
    if (typeof efficiency !== 'number' || isNaN(efficiency) || efficiency === 0) {
        return null;
    }
    const [level] = EFFICIENCY_LEVELS_THRESHOLDS.find(([, threshold]) => efficiency >= threshold) ?? [EfficiencyLevels.BAD];
    return level;
};
