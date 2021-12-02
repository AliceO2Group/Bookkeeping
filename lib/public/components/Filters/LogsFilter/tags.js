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
import { iconMinus, iconPlus } from '/js/src/icons.js';

const TAGS_LIMIT = 5;

/**
 * Radio button to toggle the filter operation
 * @param {Object} model The global model object
 * @return {vnode} The filter operation radio button elements
 */
const tagFilterOperationRadioButtons = (model) => h('.form-group-header.flex-row', ['AND', 'OR'].map((operation) =>
    h('.form-check.mr2', [
        h('input.form-check-input', {
            onclick: () => model.logs.setTagFilterOperation(operation),
            id: `tagFilterOperationRadioButton${operation}`,
            checked: operation === model.logs.getTagFilterOperation(),
            type: 'radio',
            name: 'operationRadioButtons',
        }),
        h('label.form-check-label', {
            for: `tagFilterOperationRadioButton${operation}`,
        }, operation),
    ])));

/**
 * Creates checkboxes for the tag filter subcomponent
 * @param {Object} model The global model object
 * @return {vnode} A collection of checkboxes to toggle table rows by tags
 */
const tagsFilter = (model) => {
    const tags = model.tags.getTags().payload;

    if (tags) {
        const checkboxes = tags.map((tag, index) => {
            const isChecked = model.logs.isTagInFilter(tag.id);
            return h('.form-check', [
                h('input.form-check-input', {
                    onclick: () => isChecked ? model.logs
                        .removeTagFromFilter(tag.id) : model.logs.addTagToFilter(tag.id),
                    id: `tagCheckbox${index + 1}`,
                    type: 'checkbox',
                    checked: isChecked,
                }),
                h('label.flex-row.items-center.form-check-label', {
                    for: `tagCheckbox${index + 1}`,
                }, tag.text),
            ]);
        });

        if (checkboxes.length == 0) {
            return h('.form-check.mr2'), [h('p', 'No tags.')];
        } else if (checkboxes.length <= TAGS_LIMIT) {
            return [tagFilterOperationRadioButtons(model), ...checkboxes];
        } else {
            const showMoreFilters = model.logs.shouldShowMoreTags();
            const toggleFilters = h('button.btn.btn-primary.mv1#toggleMoreTags', {
                onclick: () => model.logs.toggleMoreTags(),
            }, ...showMoreFilters ? [iconMinus(), ' Less tags'] : [iconPlus(), ' More tags']);

            const slicedCheckboxes = showMoreFilters ? checkboxes : checkboxes.slice(0, TAGS_LIMIT);
            slicedCheckboxes.splice(TAGS_LIMIT, 0, toggleFilters);

            return [tagFilterOperationRadioButtons(model), ...slicedCheckboxes];
        }
    }
    return null;
};

export default tagsFilter;
