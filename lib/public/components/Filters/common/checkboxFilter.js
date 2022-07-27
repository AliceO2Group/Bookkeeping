/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';

/**
 * 
 * @param {*} name 
 * @param {*} values
 * @param {*} isChecked
 * @param {*} onchange
 * @param {*} additionalOptions
 * @returns
 */
export const checkboxFilter = (name, values, isChecked, onChange, additionalProperties) =>
    h('.flex-row', values.map((value) => h('.form-check.flex-grow', [
        h('input.form-check-input', {
            id: `${name}Checkbox${value}`,
            class: name,
            type: 'checkbox',
            checked: isChecked(value),
            onchange: (e) => onChange(e, value),
            ...additionalProperties,
        }),
        h('label.form-check-label', {
            for: `${name}Checkbox${value}`,
        }, value.toUpperCase()),
    ])));
