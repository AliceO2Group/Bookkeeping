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

const TAGS_LIMIT = 5;

/**
 * Return a component representing a picker for a defined list of tags
 *
 * @param {Object[]} tags the list of tags to provide in the picker
 * @param {TagPickerModel} tagPickerModel the model storing the tag picker's state
 *
 * @return {vnode[]} the tags picker
 */
export const tagPicker = (tags, tagPickerModel) => {
    const checkboxes = tags.map((tag, index) => {
        /**
         * States if the current tag is currently checked or not
         *
         * @return {boolean} true if the given tag is checked
         */
        const isChecked = () => tagPickerModel.selected.find((selectedTag) => tag.id === selectedTag.id) !== undefined;

        /**
         * Call the {@see onSelect} function with all the previous tags except the current one as parameter
         *
         * @return {void}
         */
        const removeTag = () => {
            tagPickerModel.selected = tagPickerModel.selected.filter((selectedTag) => selectedTag.id !== tag.id);
        };

        /**
         * Call the {@see onSelect} function with all the previous tags plus the current one as parameter
         *
         * @return {void}
         */
        const addTag = () => {
            tagPickerModel.selected = [...tagPickerModel.selected, tag];
        };

        return h('.form-check.tag-option', [
            h('input.form-check-input', {
                onclick: () => isChecked()
                    ? removeTag()
                    : addTag(),
                id: `tagCheckbox${index + 1}`,
                type: 'checkbox',
                checked: isChecked(),
            }),
            h('label.flex-row.items-center.form-check-label', {
                for: `tagCheckbox${index + 1}`,
            }, tag.text),
        ]);
    });

    if (checkboxes.length <= TAGS_LIMIT) {
        return checkboxes;
    }

    const toggleFilters = h('button.btn.btn-primary.mv1#toggleMoreTags', {
        onclick: () => tagPickerModel.toggleCollapse(),
    }, ...tagPickerModel.collapsed ? [iconPlus(), ' More tags'] : [iconMinus(), ' Less tags']);

    const collapsablePicker = tagPickerModel.collapsed ? checkboxes.slice(0, TAGS_LIMIT) : checkboxes;
    collapsablePicker.splice(TAGS_LIMIT, 0, toggleFilters);

    return collapsablePicker;
};
