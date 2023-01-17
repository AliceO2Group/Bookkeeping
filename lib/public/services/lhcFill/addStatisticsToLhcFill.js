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

import { LhcFillStatisticsExtractor } from './LhcFillStatisticsExtractor.js';

/**
 * Compute LHC Fill statistics then append them add them to the given LHC Fill
 *
 * @param {Object} lhcFill the fill for which statistics must be computed
 * @param {Object} [statistics] the already computed statistics if it applies. If null, statistics will be computed here
 * @param {boolean} [override=false] if true, already existing lhc fill properties will be overridden
 *
 * @return {void}
 */
export const addStatisticsToLhcFill = (lhcFill, statistics = null, override = false) => {
    // Statistics only applies to stable beams
    if (!lhcFill.stableBeamsStart) {
        return;
    }

    if (null === statistics) {
        ({ statistics } = new LhcFillStatisticsExtractor(lhcFill, lhcFill.runs));
    }

    for (const key in statistics) {
        if (override || !Object.prototype.hasOwnProperty.call(lhcFill, key)) {
            lhcFill[key] = statistics[key];
        }
    }
};
