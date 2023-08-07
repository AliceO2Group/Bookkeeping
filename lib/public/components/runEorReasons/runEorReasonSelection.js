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
 * @param {Object} model A model which can store the selected EOR reason
 * @param {Object[]} eorReasonTypes the possible EOR reason types to display in the selection.
 * @returns {vnode} A pair of dropdowns to set the eor reason category and type
 */
export const eorReasonSelectionComponent = (model, eorReasonTypes) => {
    const reasonTypeCategories = [];

    for (const { category } of eorReasonTypes) {
        if (!reasonTypeCategories.includes(category)) {
            reasonTypeCategories.push(category);
        }
    }

    return [
        h('.flex-row', [
            h('select#eorCategories.form-control', {
                onchange: ({ target }) => {
                    model.newEorReason.category = target.value;
                    model.newEorReason.title = '';
                    model.notify();
                },
            }, [
                h('option', { selected: model.newEorReason.category === '', value: '' }, '-'),
                reasonTypeCategories.map((category, index) => h(`option#eorCategory${index}`, {
                    value: category,
                }, category)),
            ]),
            h('select#eorTitles.form-control', {
                onchange: ({ target }) => {
                    model.newEorReason.title = target.value;
                    model.notify();
                },
            }, [
                h('option', { selected: model.newEorReason.title === '', value: '' }, '-'),
                eorReasonTypes.filter((reason) => reason.category === model.newEorReason.category)
                    .map((reason, index) => h(
                        `option#eorTitle${index}`,
                        { value: reason.title },
                        reason.title || '(empty)',
                    )),
            ]),
        ]),
        h('input.form-control', {
            placeholder: 'Description',
            type: 'text',
            oninput: ({ target }) => {
                model.newEorReason.description = target.value;
                model.notify();
            },
        }),
    ];
};
