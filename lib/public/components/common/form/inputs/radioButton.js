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
 * @typedef RadioButtonConfigStyle
 * @property {string} labelStyle - value for the label's style property.
 * @property {string} radioButtonStyle - value for the radio button's element styling.
 */

/**
 * @typedef RadioButtonConfig - configration object for radioButton.
 *
 * @property {string} label - label to be displayed to the user for radio button
 * @property {boolean} isChecked - is radio button selected or not
 * @property {function()} action - action to be followed on user click
 * @property {string} id - id of the radiobutton element
 * @property {string} name - name of the radiobutton element
 * @property {RadioButtonConfigStyle} style - label style property
 */

/**
 * Build a radio button with its configuration and actions
 * @param {RadioButtonConfig} configuration - configuration object for radioButton.
 * @return {vnode} - radio button with associated label.
 */
export const radioButton = (configuration = {}) => {
    const {
        label = '',
        isChecked = false,
        action = () => { },
        name = '',
        id = `${name}${label}`,
        style = { labelStyle: 'cursor: pointer;', radioButtonStyle: '.w-33' },
    } = configuration;
    return h(`${style.radioButtonStyle}.form-check`, [
        h('input.form-check-input', {
            onchange: action,
            type: 'radio',
            id,
            name,
            value: label,
            checked: isChecked,
        }),
        h('label.form-check-label', {
            style: style.labelStyle,
            for: id,
        }, label),
    ]);
};
