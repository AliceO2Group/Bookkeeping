/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { formatDuration } from './formatDuration.mjs';
import { formatPercentage } from './formatPercentage.js';

/**
 * Format the given time and efficiency loss into a human-readable string
 *
 * @param {number} timeLoss the time loss to format
 * @param {number} efficiencyLoss the efficiency loss (percentage)
 * @return {string} the formatted result
 */
export const formatTimeAndEfficiencyLoss = (timeLoss, efficiencyLoss) => {
    if ((timeLoss ?? efficiencyLoss ?? null) === null) {
        return '-';
    }
    return `${formatDuration(timeLoss)} (${formatPercentage(efficiencyLoss)})`;
};
