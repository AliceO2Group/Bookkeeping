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
import { filterSelectionOptions } from '../filterSelectionOptions.js';

/**
 * @typedef PickerConfiguration The configuration of the picker
 * @property {string} [filter='picker'] if specified, this will be used to filter displayed options
 * @property {string} [selector='picker'] if specified, this will be used to customize picker components ids and classes
 * @property {object|null} [optionsAttributes=null] attributes applied to picker elements
 * @property {boolean} [outlineSelection=false] if true, the current selection will be displayed at the top of the choices list
 */

/**
 * Generates a picker component
 *
 * @param {SelectionModel} selectionModel The selection model.
 * @param {PickerConfiguration} [configuration] the picker's configuration
 * @returns {Component} A filterable collapsable picker.
 */
export const picker = (selectionModel, configuration) => {
    const { selector = 'picker', filter = '', optionsAttributes = null } = configuration || {};

    const checkboxes = filterSelectionOptions(selectionModel.options, filter).map((pickerOption, index) => h(
        `.flex-row.${selector}-option.g2`,
        { key: pickerOption.rawLabel || pickerOption.label || pickerOption.value },
        [
            h(
                'input',
                {
                    onclick: () => selectionModel.isSelected(pickerOption)
                        ? selectionModel.deselect(pickerOption)
                        : selectionModel.select(pickerOption),
                    id: `${selector}Checkbox${index + 1}`,
                    type: 'checkbox',
                    checked: selectionModel.isSelected(pickerOption),
                    disabled: optionsAttributes?.disabled,
                },
            ),
            h(
                'label.label.flex-row.items-center',
                {
                    ...optionsAttributes,
                    for: `${selector}Checkbox${index + 1}`,
                },
                pickerOption.label || pickerOption.value,
            ),
        ],
    ));

    return checkboxes.length ? checkboxes : h('em', 'No options');
};
