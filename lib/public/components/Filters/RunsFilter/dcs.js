/**
 * @license
 * Copyright CERN and copyright holders of ALICE Trg. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-Trg.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';

/**
 * Filter panel for DCS toggle; ON/OFF/ANY
 * @param {Object} model The global model object
 * @return {vnode} Three radio buttons inline
 */
const dcsOperationRadioButtons = (model) => {
    const state = model.runs.getDcsFilterOperation();
    return h('.form-group-header.flex-row.w-100', [
        radioButton(state, 'ANY', () => model.runs.removeDcs()),
        radioButton(state, 'OFF', () => model.runs.setDcsFilterOperation(false)),
        radioButton(state, 'ON', () => model.runs.setDcsFilterOperation(true)),
    ]);
};

/**
 * Build a radio button with its configuration and actions
 * @param {Boolean/String} state - state of filter ('', true, false)
 * @param {String} label - label to be displayed to the user for radio button
 * @param {Function} action - action to be followed on user click
 * @return {vnode} - radio button with label associated
 */
const radioButton = (state, label, action) => {
    const isChecked = state === '' && label === 'ANY' ||
        state === true && label === 'ON' ||
        state === false && label === 'OFF';
    return h('.w-33.form-check', [
        h('input.form-check-input', {
            onchange: action,
            type: 'radio',
            id: `dcsFilterRadio${label}`,
            name: 'dcsFilterRadio',
            value: label,
            checked: isChecked,
        }, ''),
        h('label.form-check-label', {
            style: 'cursor: pointer;',
            for: `dcsFilterRadio${label}`,
        }, label),
    ]);
};

export default dcsOperationRadioButtons;
