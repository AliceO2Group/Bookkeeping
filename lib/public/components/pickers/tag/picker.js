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
 */

/**
 * Creation of a picker.
 * @param {PickerOption[]} pickerOptions The available options of the picker
 * @param {PickerModel} pickerModel The picker model.
 * @param {PickerConfiguration} [configuration] the picker's configuration
 * @returns {vnode[]} A filterable collapsable picker.
 */
export const picker = (pickerOptions, pickerModel, configuration) => {
    const { limit = 5, selector = 'picker' } = configuration || {};

    const checkboxes = pickerOptions.map((pickerOption, index) => h(`.form-check.${selector}-option`, [
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

    if (limit === null || checkboxes.length <= limit) {
        return checkboxes;
    }

    const toggleFilters = h(
        `button.btn.btn-primary.mv1#${selector}ToggleMore`,
        { onclick: () => pickerModel.toggleCollapse() },
        ...pickerModel.collapsed ? [iconPlus(), ' More'] : [iconMinus(), ' Less'],
    );

    const collapsablePicker = pickerModel.collapsed ? checkboxes.slice(0, limit) : checkboxes;
    collapsablePicker.splice(limit, 0, toggleFilters);

    return collapsablePicker;
};
