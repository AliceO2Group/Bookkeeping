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
 * @typedef {PickerValue} A value with an id and text to be shown and check selected.
 * @property {number|string} id The id of the object this is used to see if it is checked.
 * @property {string} text The text that needs to be displayed for the user.
 */

/**
 * Creation of a picker.
 * @param {PickerValue[]} pickerValues The values that need to be shown.
 * @param {PickerModel} pickerModel The picker model.
 * @param {number} limit amount of values to be shown before collapsable block is shown.
 * @returns {vNode} A filterable collaplsable picker.
 */
export const picker = (pickerValues, pickerModel, limit = 5) => {
    const name = pickerModel.name ? pickerModel.name : '';
    const checkboxes = pickerValues.map((pickerObject, index) => {
        /**
         * States if the current picker is currently checked or not
         *
         * @return {boolean} true if the given picker is checked
         */
        const isSelected = () => pickerModel.selected.find((selectedPickerObject) => pickerObject.id === selectedPickerObject.id) !== undefined;

        /**
         * Call the {@see onSelect} function with all the previous pickers except the current one as parameter
         *
         * @return {void}
         */
        const remove = () => {
            pickerModel.selected = pickerModel.selected.filter((selectedPickerObject) => selectedPickerObject.id !== pickerObject.id);
        };

        /**
         * Call the {@see onSelect} function with all the previous pickers plus the current one as parameter
         *
         * @return {void}
         */
        const add = () => {
            pickerModel.selected = [...pickerModel.selected, pickerObject];
        };

        return h(`.form-check.${name}-option`, [
            h('input.form-check-input', {
                onclick: () => isSelected()
                    ? remove()
                    : add(),
                id: `${name}Checkbox${index + 1}`,
                type: 'checkbox',
                checked: isSelected(),
            }),
            h('label.flex-row.items-center.form-check-label', {
                for: `${name}Checkbox${index + 1}`,
            }, pickerObject.text),
        ]);
    });

    if (checkboxes.length <= limit) {
        return checkboxes;
    }

    const toggleFilters = h(`button.btn.btn-primary.mv1#${name}ToggleMore`, {
        onclick: () => pickerModel.toggleCollapse(),
    }, ...pickerModel.collapsed ? [iconPlus(), ' More'] : [iconMinus(), ' Less']);

    const collapsablePicker = pickerModel.collapsed ? checkboxes.slice(0, limit) : checkboxes;
    collapsablePicker.splice(limit, 0, toggleFilters);

    return collapsablePicker;
};
