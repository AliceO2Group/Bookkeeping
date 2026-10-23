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
    BAD: 'bad',
});

export const GREAT_EFFICIENCY_THRESHOLD = 0.95;
export const GOOD_EFFICIENCY_THRESHOLD = 0.8;

/**
 * Returns the level of the given efficiency: great from 95%, good from 80% to 95% excluded, else bad
 *
 * @param {number|null|undefined} efficiency the efficiency of the fill, normalized between 0 and 1
 * @return {EfficiencyLevels|null} the level, or null if the efficiency is unknown or null (no level is displayed for them)
 */
export const getEfficiencyLevel = (efficiency) => {
    if (typeof efficiency !== 'number' || isNaN(efficiency) || efficiency === 0) {
        return null;
    }
    if (efficiency >= GREAT_EFFICIENCY_THRESHOLD) {
        return EfficiencyLevels.GREAT;
    }
    return efficiency >= GOOD_EFFICIENCY_THRESHOLD ? EfficiencyLevels.GOOD : EfficiencyLevels.BAD;
};
