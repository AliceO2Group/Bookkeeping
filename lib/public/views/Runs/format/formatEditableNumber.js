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

import { formatFloat } from '../../../utilities/formatting/formatFloat.js';
import { h } from '/js/src/index.js';

/**
 * Format a editable numeric property
 *
 * @param {boolean} isEditionEnabled if true the input is displayed, current values otherwise
 * @param {number} current the current value
 * @param {function(InputEvent, void)} oninput callback
 * @param {RunDetailsModel} runDetailsModel details model
 * @param {number} [options.inputDecimals = 3] precision of input value
 * @param {number} [options.displayDecimals = 3] precision of displayed value
 * @return {Component} display or input
 */
export const formatEditableNumber = (
    isEditionEnabled,
    current,
    oninput,
    { inputDecimals = 3, displayDecimals = 3, unit = null } = {},
) => {
    if (isEditionEnabled) {
        return h('.flex-row.g1', [
            h('input.form-control', {
                type: 'number',
                step: Math.pow(10, -inputDecimals),
                value: current,
                oninput,
            }),
            unit ? h('', unit) : null,
        ]);
    } else {
        return current !== null && current !== undefined ? h('.flex-row.g1', [
            formatFloat(current, { precision: displayDecimals }),
            unit ? h('', unit) : null,
        ]) : '-';
    }
};
