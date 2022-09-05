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
 * Filter panel for EPN toggle; ON/OFF/ANY
 * @param {RunModel} runModel the run model object
 * @return {vnode} Three radio buttons inline
 */
const epnOperationRadioButtons = (runModel) => {
    const state = runModel.getEpnFilterOperation();
    return h('.form-group-header.flex-row.w-100', [
        radioButton('ANY', state === '', () => runModel.removeEpn()),
        radioButton('OFF', state === false, () => runModel.setEpnFilterOperation(false)),
        radioButton('ON', state === true, () => runModel.setEpnFilterOperation(true)),
    ]);
};

/**
 * Build a radio button with its configuration and actions
 * @param {String} label - label to be displayed to the user for radio button
 * @param {Boolean} isChecked - is radio button selected or not
 * @param {Function} action - action to be followed on user click
 * @return {vnode} - radio button with label associated
 */
const radioButton = (label, isChecked, action) => h('.w-33.form-check', [
    h('input.form-check-input', {
        onchange: action,
        type: 'radio',
        id: `epnFilterRadio${label}`,
        name: 'epnFilterRadio',
        value: label,
        checked: isChecked,
    }, ''),
    h('label.form-check-label', {
        style: 'cursor: pointer;',
        for: `epnFilterRadio${label}`,
    }, label),
]);

export default epnOperationRadioButtons;
