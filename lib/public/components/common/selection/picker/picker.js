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

/**
 * @typedef PickerConfiguration The configuration of the picker
 * @property {string} [selector='picker'] if specified, this will be used to customize picker components ids and classes
 * @property {number|null} [attributes=null] if specified, picker items will be wrapped within a component with these attributes. If a limit is
 *     present and the items overflow, the overflowed elements will be wrapped in a separated component with the same attributes
 * @property {boolean} [outlineSelection=false] if true, the current selection will be displayed at the top of the choices list
 * @property {Component|null} [placeHolder=null]  if not null, this component will be displayed at the top of the choices list if the selection
 *     is empty
 */

/**
 * Returns the list of input components that correspond to the given options list
 *
 * @param {PickerModel} pickerModel the model containing the current inputs states
 * @param {SelectionOption[]} pickerOptions the list of options to display
 * @param {string} selector selector to customize input components selectors
 * @return {Component[]} the list of inputs
 */
const mapOptionsToInput = (pickerModel, pickerOptions, selector) => pickerOptions.map((pickerOption, index) => h(
    `.form-check.${selector}-option`,
    { key: pickerOption.rawLabel || pickerOption.label || pickerOption.value },
    [
        h(
            'input.form-check-input',
            {
                onclick: () => pickerModel.isSelected(pickerOption)
                    ? pickerModel.deselect(pickerOption)
                    : pickerModel.select(pickerOption),
                id: `${selector}Checkbox${index + 1}`,
                type: 'checkbox',
                checked: pickerModel.isSelected(pickerOption),
            },
        ),
        h(
            'label.flex-row.items-center.form-check-label',
            {
                for: `${selector}Checkbox${index + 1}`,
            },
            pickerOption.label || pickerOption.value,
        ),
    ],
));

/**
 * Generates a picker component
 *
 * @param {SelectionOption[]} pickerOptions The available options of the picker
 * @param {PickerModel} pickerModel The picker model.
 * @param {PickerConfiguration} [configuration] the picker's configuration
 * @returns {Component} A filterable collapsable picker.
 */
export const picker = (pickerOptions, pickerModel, configuration) => {
    const { selector = 'picker', attributes = null, placeHolder = null, searchEnabled = true } = configuration || {};

    const checkboxes = mapOptionsToInput(pickerModel, pickerOptions, selector);

    const selectedPills = pickerModel.selectedOptions.length
        ? h(
            '.flex-row.flex-wrap.g2',
            pickerModel.selectedOptions.map(({ rawLabel, label, value }) => h(
                '',
                { key: rawLabel || label || value },
                label || value,
            )),
        )
        : placeHolder;

    /**
     * If attributes is not null, wrap the given content inside a component with the given attributes
     *
     * @param {Component} toWrap component(s) to wrap
     * @return {Component} the wrapped result
     */
    const applyAttributes = (toWrap) => {
        if (attributes && toWrap) {
            return h('', attributes, toWrap);
        } else {
            return toWrap;
        }
    };

    if (searchEnabled) {
        return [
            selectedPills,
            h(`input.form-control.${selector}-search-input`, {
                type: 'search',
                placeHolder: '🔍 Search for tags',
                value: pickerModel.searchInputContent,
                oninput: (e) => {
                    pickerModel.searchInputContent = e.target.value;
                },
            }),
            applyAttributes(checkboxes.length ? checkboxes : h('em', 'No options')),
        ];
    } else {
        return h('.flex-column.g3', [
            selectedPills,
            applyAttributes(checkboxes.length ? checkboxes : h('em', 'No options')),
        ]);
    }
};
