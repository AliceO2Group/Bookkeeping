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

import { CombinationOperation } from '../TagFilterModel.js';
import { h } from '/js/src/index.js';
import { picker } from '../../../pickers/tag/picker.js';
import { tagToOption } from '../../../tag/tagToOption.js';

/**
 * Radio button to toggle the filter operation
 *
 * @param {string} current the currently applied operation
 * @param {function} onChange callback called when a new operation is selected
 *
 * @return {vnode} The filter operation radio button elements
 */
const tagFilterOperationRadioButtons = (current, onChange) => h(
    '.form-group-header.flex-row',
    Object.values(CombinationOperation).map((operation) =>
        h('.form-check.mr2', [
            h('input.form-check-input', {
                onclick: () => onChange(operation),
                id: `tagFilterOperationRadioButton${operation}`,
                checked: operation === current,
                type: 'radio',
                name: 'operationRadioButtons',
            }),
            h('label.form-check-label', {
                for: `tagFilterOperationRadioButton${operation}`,
            }, operation),
        ])),
);

/**
 * Returns a filter component to apply filtering on a defined list of tags
 *
 * @param {Object[]} tags the list of available tags
 * @param {TagFilterModel} filter the model storing the filter's state
 *
 * @return {vnode|vnode[]} the filter component
 */
export const tagFilter = (tags, filter) => {
    const visibleCheckboxes = picker(
        tags.map(tagToOption),
        filter.pickerModel,
        { selector: 'tag' },
    );

    if (visibleCheckboxes.length === 0) {
        return h('p', 'No tags.');
    }

    return [
        tagFilterOperationRadioButtons(filter.combinationOperation, (operation) => {
            filter.combinationOperation = operation;
        }),
        ...visibleCheckboxes,
    ];
};
