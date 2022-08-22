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

const TYPES_LIMIT = 5;

/**
 * Return a component representing a picker for a defined list of run types
 *
 * @param {Object[]} runTypes the list of run types to provide in the picker
 * @param {TagPickerModel} runTypesPickerModel the model storing the run type picker's state
 *
 * @return {vnode[]} the types picker
 */
export const runTypesPicker = (runTypes, runTypesPickerModel) => {
    const checkboxes = runTypes.map((runType, index) => {
        /**
         * States if the current runTypes is currently checked or not
         *
         * @return {boolean} true if the given runTypes is checked
         */
        const isChecked = () => runTypesPickerModel.selected.find((selectedTag) => runTypes.id === selectedTag.id) !== undefined;

        /**
         * Call the {@see onSelect} function with all the previous runTypes except the current one as parameter
         *
         * @return {void}
         */
        const removeTag = () => {
            runTypesPickerModel.selected = runTypesPickerModel.selected.filter((selectedTag) => selectedTag.id !== runTypes.id);
        };

        /**
         * Call the {@see onSelect} function with all the previous runTypes plus the current one as parameter
         *
         * @return {void}
         */
        const addTag = () => {
            runTypesPickerModel.selected = [...runTypesPickerModel.selected, runTypes];
        };

        return h('.form-check.tag-option', [
            h('input.form-check-input', {
                onclick: () => isChecked()
                    ? removeTag()
                    : addTag(),
                id: `runTypesCheckbox${index + 1}`,
                type: 'checkbox',
                checked: isChecked(),
            }),
            h('label.flex-row.items-center.form-check-label', {
                for: `runTypesCheckbox${index + 1}`,
            }, runType.name),
        ]);
    });

    if (checkboxes.length <= TYPES_LIMIT) {
        return checkboxes;
    }

    const toggleFilters = h('button.btn.btn-primary.mv1#toggleMoreTags', {
        onclick: () => runTypesPickerModel.toggleCollapse(),
    }, ...runTypesPickerModel.collapsed ? [iconPlus(), ' More types'] : [iconMinus(), ' Less types']);

    const collapsablePicker = runTypesPickerModel.collapsed ? checkboxes.slice(0, TYPES_LIMIT) : checkboxes;
    collapsablePicker.splice(TYPES_LIMIT, 0, toggleFilters);

    return collapsablePicker;
};
