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
 * @typedef radioButtonConfig - configration object for radioButton.
 *
 * @property {string} label - label to be displayed to the user for radio button
 * @property {boolean} isChecked - is radio button selected or not
 * @property {function} action - action to be followed on user click
 * @property {string} id - id of the radiobutton element
 * @property {string} name - name of the radiobutton element
 * @property {string} style - label style property
 */

/**
 * Build a radio button with its configuration and actions
 * @param {radioButtonConfig} configuration - configration object for radioButton.
 * @return {vnode} - radio button with associated label.
 */
const radiobutton = (configuration = {}) => {
    const {
        label = 'radio',
        isChecked = false,
        action = () => { },
        name = 'value',
        id = `${name}${label}`,
        style = 'cursor: pointer;',
    } = configuration;
    return h('.w-33.form-check', [
        h('input.form-check-input', {
            onchange: action,
            type: 'radio',
            id: id,
            name: name,
            value: label,
            checked: isChecked,
        }, ''),
        h('label.form-check-label', {
            style: style,
            for: `${name}${label}`,
        }, label),
    ]);
};

export default radiobutton;
