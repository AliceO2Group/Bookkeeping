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

import { h } from '/js/src/index.js';
import { formatPercentage } from '../../../utilities/formatting/formatPercentage.js';
import { getEfficiencyLevel } from './efficiencyLevel.js';

/**
 * Display the efficiency of a fill as a percentage, in a badge whose color depends on its level (a null efficiency has no styling)
 *
 * @param {number|null|undefined} efficiency the efficiency of the fill, normalized between 0 and 1
 * @return {Component|string} the formatted efficiency
 */
export const formatEfficiency = (efficiency) => {
    const level = getEfficiencyLevel(efficiency);
    return level
        ? h(`.efficiency.efficiency-${level}`, formatPercentage(efficiency))
        : formatPercentage(efficiency);
};
