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

import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { h } from '/js/src/index.js';
import { getLocaleDateAndTime } from '../../../utilities/dateUtils.mjs';

/**
 * Format a given lhcFill's stable beam start date
 *
 * @param {LhcFill} lhcFill the lhcFill for which start date must be formatted
 * @param {object} [configuration] eventual display configuration
 * @param {boolean} [configuration.inline] true if the date must be inlined
 * @return {Component} the formatted start date
 */
export const formatStableBeamsStart = (lhcFill, configuration) => {
    const { inline = false } = configuration || {};
    const { stableBeamStart } = lhcFill;
   
    if (stableBeamStart === null || stableBeamStart === undefined) return '-';
    
    if (inline) {
        return h('span', [
            h('.flex-row.items-center.g2', [ formatTimestamp(stableBeamStart, inline) ]),
        ]);
    } else {
        const { date, time } = getLocaleDateAndTime(stableBeamStart);
        return h('', [
            h('', date),
            h('.flex-row.g2.items-center', [h('', time)]),
        ]);
    }
};
