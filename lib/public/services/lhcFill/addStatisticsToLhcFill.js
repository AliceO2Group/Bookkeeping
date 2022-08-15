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

import { computeLhcFillStatistics } from './computeLhcFillStatistics.js';

/**
 * Compute LHC Fill statistics then append them add them to the given LHC Fill
 *
 * @param {object} lhcFill the fill for which statistics must be computed
 *
 * @return {void}
 */
export const addStatisticsToLhcFill = (lhcFill) => {
    // Statistics only applies to stable beams
    if (!lhcFill.stableBeamsStart) {
        return;
    }

    const statistics = computeLhcFillStatistics(
        lhcFill.runs,
        lhcFill.stableBeamsDuration * 1000,
        lhcFill.stableBeamsStart,
        lhcFill.stableBeamsEnd,
    );
    for (const key in statistics) {
        if (!Object.prototype.hasOwnProperty.call(lhcFill, key)) {
            lhcFill[key] = statistics[key];
        }
    }
};
