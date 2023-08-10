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
 * A component with dropdowns allowing the user to select an EOR reason type
 * @param {EorReasonFilterModel} eorReasonFilterModel A model which can store the selected EOR reason
 * @param {Object[]} eorReasonTypes the possible EOR reason types to display in the selection.
 * @returns {vnode} A pair of dropdowns and a text input to filter for eor reason category title, and description
 */
export const eorReasonSelectionComponent = (eorReasonFilterModel, eorReasonTypes) => {
    const { filterEorReason } = model
    const reasonTypeCategories = [...new Set(eorReasonTypes.map(({category}) => category))];

    return [
        h('.flex-row', [
            h('select#eorCategories.form-control', {
                onchange: ({ target }) => {
                    eorReasonFilterModel.setFilterEorReasonCategory(target.value);
                },
            }, [
                h('option', { selected: filterEorReason.category === '', value: '' }, '-'),
                reasonTypeCategories.map((category, index) => h(`option#eorCategory${index}`, {
                    value: category,
                }, category)),
            ]),
            h('select#eorTitles.form-control', {
                onchange: ({ target }) => {
                    eorReasonFilterModel.setFilterEorReasonTitle(target.value);
                },
            }, [
                h('option', { selected: filterEorReason.title === '', value: '' }, '-'),
                eorReasonTypes.filter((reason) => reason.category === filterEorReason.category)
                    .map((reason, index) => h(
                        `option#eorTitle${index}`,
                        { value: reason.title },
                        reason.title || '(empty)',
                    )),
            ]),
        ]),
        h('input#eorDescription.form-control', {
            placeholder: 'Description',
            type: 'text',
            value: filterEorReason.description,
            oninput: ({ target }) => {
                eorReasonFilterModel.setFilterEorReasonDescription(target.value)
            },
        }),
    ];
};
