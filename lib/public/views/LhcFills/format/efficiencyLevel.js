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
 * Scale of the efficiency of a LHC fill, from the best level to the worst one. This is the only definition of the scale: the level of an
 * efficiency and the legend are both computed from it
 *
 * @type {{level: string, minimum: number}[]} the levels, with the minimal efficiency (normalized between 0 and 1) to reach them. The last one
 *     has no real minimum, it is the level of everything below the previous one
 */
export const EFFICIENCY_SCALE = Object.freeze([
    { level: 'great', minimum: 0.95 },
    { level: 'good', minimum: 0.8 },
    { level: 'fair', minimum: 0.7 },
    { level: 'poor', minimum: 0.5 },
    { level: 'bad', minimum: 0 },
]);

/**
 * Returns the level of the given efficiency according to the scale
 *
 * @param {number|null|undefined} efficiency the efficiency of the fill, normalized between 0 and 1
 * @return {string|null} the level, or null if the efficiency is unknown or null (no level is displayed for them)
 */
export const getEfficiencyLevel = (efficiency) => {
    if (typeof efficiency !== 'number' || isNaN(efficiency) || efficiency === 0) {
        return null;
    }
    const { level } = EFFICIENCY_SCALE.find(({ minimum }) => efficiency >= minimum) ?? EFFICIENCY_SCALE[EFFICIENCY_SCALE.length - 1];
    return level;
};
