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
import { labelledLine } from './labelledLine.js';

/**
 * Format the number of EPNs: the count if known, ON if EPNs are used without a known count, OFF otherwise
 *
 * @param {boolean} epn true if EPNs are used
 * @param {number|null} nEpns the number of EPNs
 * @return {string|number} the formatted value
 */
const formatEpnsCount = (epn, nEpns) => {
    if (!epn) {
        return 'OFF';
    }
    return typeof nEpns === 'number' ? nEpns : 'ON';
};

/**
 * Display the data taking configuration of a run or of an environment: the number of EPNs and FLPs, the DCS state and the trigger, two by line
 *
 * @param {string} idPrefix the prefix of the ids of the elements (e.g. `row123`)
 * @param {object} configuration the configuration to display
 * @param {boolean} configuration.epn true if EPNs are used
 * @param {number|null} configuration.nEpns the number of EPNs
 * @param {number|null} configuration.nFlps the number of FLPs
 * @param {boolean} configuration.dcs true if DCS is enabled
 * @param {string|null} configuration.triggerValue the trigger (OFF, LTU or CTP)
 * @return {Component} the configuration
 */
export const dataTakingConfiguration = (idPrefix, { epn, nEpns, nFlps, dcs, triggerValue }) => h('', [
    h(`#${idPrefix}-nodes.flex-row.g2`, [
        labelledLine(`${idPrefix}-nEpns`, 'EPNs', formatEpnsCount(epn, nEpns)),
        labelledLine(`${idPrefix}-nFlps`, 'FLPs', nFlps ?? '-'),
    ]),
    h(`#${idPrefix}-states.flex-row.g2`, [
        labelledLine(`${idPrefix}-dcs`, 'DCS', dcs ? 'ON' : 'OFF'),
        labelledLine(`${idPrefix}-triggerValue`, 'TRG', triggerValue || '-'),
    ]),
]);
