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

import { h, iconMinus, iconPlus } from '/js/src/index.js';

/**
 * @typedef PickerConfiguration The configuration of the picker
 * @property {number|null} [limit=5] Amount of items to be shown before collapsable block is shown (null will display all the items)
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
 * @param {PickerOption[]} pickerOptions the list of options to display
 * @param {string} selector selector to customize input components selectors
 * @param {PickerModel} pickerModel the model containing the current inputs states
 * @return {Component[]} the list of inputs
 */
const mapOptionsToInput = (pickerOptions, selector, pickerModel) => pickerOptions.map((
    pickerOption,
    index,
) => h(`.form-check.${selector}-option`, [
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
]));

/**
 * Generates a picker component
 *
 * @param {PickerOption[]} pickerOptions The available options of the picker
 * @param {PickerModel} pickerModel The picker model.
 * @param {PickerConfiguration} [configuration] the picker's configuration
 * @returns {Component} A filterable collapsable picker.
 */
export const picker = (pickerOptions, pickerModel, configuration) => {
    const { limit = 5, selector = 'picker', attributes = null, outlineSelection = false, placeHolder = null } = configuration || {};

    const checkboxes = mapOptionsToInput(pickerOptions, selector, pickerModel);

    const selectedPills = pickerModel.selectedOptions.length > 0 && outlineSelection
        ? h(
            '.flex-row.flex-wrap.g2',
            pickerModel.selectedOptions.map(({ label, value }) => h('small.badge.bg-gray-light', label || value)),
        )
        : placeHolder;

    const header = selectedPills ? h('', [selectedPills, h('hr')]) : null;

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

    const toggleFilters = h(
        `button.btn.btn-primary.mv1#${selector}ToggleMore`,
        { onclick: () => pickerModel.toggleCollapse() },
        ...pickerModel.collapsed ? [iconPlus(), ' More'] : [iconMinus(), ' Less'],
    );

    let alwaysVisible = applyAttributes(checkboxes);
    let collapsable = null;
    if (limit && checkboxes.length > limit) {
        alwaysVisible = applyAttributes(checkboxes.slice(0, limit));
        collapsable = [toggleFilters];
        if (!pickerModel.collapsed) {
            collapsable.push(applyAttributes(checkboxes.slice(limit)));
        }
    }

    return [
        header,
        alwaysVisible,
        collapsable,
    ];
};
