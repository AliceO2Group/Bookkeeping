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
 * A general component for generating checkboxes.
 *
 * @param {string} name The general name of the element.
 * @param {Array<String>} values the list of options to display
 * @param {function} isChecked true if the checkbox is checked, else false
 * @param {function} onChange the handler called once the checkbox state changes (change event is passed as first parameter, value as second)
 * @param {Object} [additionalProperties] Additional options that can be given to the class.
 * @returns {vnode} An object that has one or multiple checkboxes.
 */
export const checkboxFilter = (name, values, isChecked, onChange, additionalProperties) =>
    h('.flex-row.flex-wrap', values.map((value) => h('.form-check.flex-grow', [
        h('input.form-check-input', {
            id: `${name}Checkbox${value}`,
            class: name,
            type: 'checkbox',
            checked: isChecked(value),
            onchange: (e) => onChange(e, value),
            ...additionalProperties || {},
        }),
        h('label.form-check-label', {
            for: `${name}Checkbox${value}`,
        }, value.toUpperCase()),
    ])));

/**
 * A general component for generating checkboxes.
 * @param {SelectionModel} selectionModel fiter model
 * @param {Object} [additionalProperties = {}] additional options that can be given to checkboxes.
 * @param {string} [additionalProperties.id] input identifers prefix
 * @return {Componenet} filter componenet
 */
export const modeledCheckboxFilter = (selectionModel, additionalProperties = {}) =>
    h('.flex-row.flex-wrap', selectionModel.options.map((option) => h('.form-check.flex-grow', [
        h('input.form-check-input', {
            id: `${additionalProperties.id}-checkbox-${option.value}`,
            type: 'checkbox',
            checked: selectionModel.isSelected(option),
            onchange: () => selectionModel.isSelected(option) ? selectionModel.deselect(option) : selectionModel.select(option),
            ...additionalProperties,
        }),
        h('label.form-check-label', {
            for: `${additionalProperties.id}-checkbox-${option.value}`,
        }, option.label || option.value),
    ])));
