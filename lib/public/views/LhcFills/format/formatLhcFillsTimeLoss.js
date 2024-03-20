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

import { h } from '@aliceo2/web-ui/Frontend/js/src/index.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { formatPercentage } from '../../../utilities/formatting/formatPercentage.js';

/**
 * Formats the duration and loss percentage to display, with the option of
 * separating the duration and percentage by a newline or not.
 *
 * @param {number} duration the duration to display, in milliseconds.
 * @param {number} efficiencyLoss the percentage to display, normalized between 0 and 1.
 * @param {boolean} [inline] if true, the duration and loss will be returned as a string.
 *      Else, a component will be returned, where the duration and loss are separated by a newline.
 * @returns {vnode|string} the formatted duration and percentage.
 */
export const formatLhcFillsTimeLoss = (duration, efficiencyLoss, inline = true) => {
    if (!duration) {
        return '-';
    }

    const formattedDuration = formatDuration(duration);
    const formattedEfficiencyLossPercentage = formatPercentage(efficiencyLoss);

    if (inline) {
        return `${formattedDuration} (${formattedEfficiencyLossPercentage})`;
    }

    return h('', [formattedDuration, h('br'), `(${formattedEfficiencyLossPercentage})`]);
};
