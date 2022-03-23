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
 * Filter panel for Data Distribution toggle; ON/OFF/ANY
 * @param {Object} model The global model object
 * @return {vnode} Three radio buttons inline
 */
const ddflpOperationRadioButtons = (model) => {
    const state = model.runs.getDdflpFilterOperation();
    return h('.form-group-header.flex-row.w-100', [
        radioButton('ANY', state === '', () => model.runs.removeDdflp()),
        radioButton('OFF', state === false, () => model.runs.setDdflpFilterOperation(false)),
        radioButton('ON', state === true, () => model.runs.setDdflpFilterOperation(true)),
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
        id: `ddFlpFilterRadio${label}`,
        name: 'ddFlpFilterRadio',
        value: label,
        checked: isChecked,
    }, ''),
    h('label.form-check-label', {
        style: 'cursor: pointer;',
        for: `ddFlpFilterRadio${label}`,
    }, label),
]);

export default ddflpOperationRadioButtons;
