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
 * Format a given the lhcFill's stable beam end date
 *
 * @param {LhcFill} lhcFill the lhcFill for which end date must be formatted
 * @param {number} [lhcFill.stableBeamEnd] the time at which a beam would end
 * @param {object} [configuration] eventual display configuration
 * @param {boolean} [configuration.inline] true if the date must be inlined
 * @return {Component} the formatted end date
 */
export const formatStableBeamsEnd = ({ stableBeamEnd }, { inline = false } = {}) => {
    if (stableBeamEnd === null || stableBeamEnd === undefined) return '-';

    if (inline) {
        return h('span', [
            h('.flex-row.items-center.g2', [ formatTimestamp(stableBeamEnd, inline) ]),
        ]);
    } else {
        const { date, time } = getLocaleDateAndTime(stableBeamEnd);
        return h('', [
            h('', date),
            h('.flex-row.g2.items-center', [ h('', time) ]),
        ]);
    }
};
