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
 *
 * @param {EorReasonFilterModel} eorReasonFilterModel A model which can store the selected EOR reason
 * @param {Object[]} eorReasonTypes the possible EOR reason types to display in the selection.
 * @return {vnode} A pair of dropdowns and a text input to filter for eor reason category title, and description
 */
export const eorReasonFilterComponent = (eorReasonFilterModel, eorReasonTypes) => {
    const eorReasonsCategories = [...new Set(eorReasonTypes.map(({ category }) => category))];

    return [
        h('.flex-row', [
            h(
                'select#eorCategories.form-control',
                {
                    onchange: ({ target }) => {
                        eorReasonFilterModel.category = target.value;
                    },
                    value: eorReasonFilterModel.category,
                },
                [
                    h('option', { selected: eorReasonFilterModel.category === '', value: '' }, '-'),
                    eorReasonsCategories.map((category, index) => h(
                        `option#eorCategory${index}`,
                        { key: category, value: category },
                        category,
                    )),
                ],
            ),
            h(
                'select#eorTitles.form-control',
                {
                    onchange: ({ target }) => {
                        eorReasonFilterModel.title = target.value;
                    },
                    value: eorReasonFilterModel.title,
                },
                [
                    h('option', { selected: eorReasonFilterModel.title === '', value: '' }, '-'),
                    eorReasonTypes
                        .filter((reason) => reason.category === eorReasonFilterModel.category)
                        .map(({ title }, index) => h(
                            `option#eorTitle${index}`,
                            { key: title, value: title },
                            title || '(empty)',
                        )),
                ],
            ),
        ]),
        h('input#eorDescription.form-control', {
            placeholder: 'Description',
            value: eorReasonFilterModel.description,
            oninput: ({ target }) => eorReasonFilterModel.setDescription(target.value, false),
            onchange: ({ target }) => eorReasonFilterModel.setDescription(target.value, true),
        }),
    ];
};
