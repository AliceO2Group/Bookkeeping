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

import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { formatPercentage } from '../../../utilities/formatting/formatPercentage.js';
import { h } from '/js/src/index.js';

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
