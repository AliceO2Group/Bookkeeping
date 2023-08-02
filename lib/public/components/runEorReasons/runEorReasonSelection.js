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

export const eorReasonSelectionComponent = (model, eorReasonTypes) => {
    const reasonTypeCategories = [];
            
    for (const { category } of eorReasonTypes) {
        if (!reasonTypeCategories.includes(category)) {
            reasonTypeCategories.push(category);
        }
    }
    
    return h('.flex-row', [
        h('select.w-30.form-control', {
            onchange: ({ target }) => {
                model.newEorReason.category = target.value;
                model.newEorReason.title = '';
                model.notify();
            },
        }, [
            h('option', { disabled: true, selected: model.newEorReason.category === '', value: '' }, '-'),
            reasonTypeCategories.map((category, index) => h(`option#eorCategory${index}`, {
                value: category,
            }, category)),
        ]),
        h('select.w-30.form-control', {
            onchange: ({ target }) => {
                model.newEorReason.title = target.value;
                model.notify();
            },
        }, [
            h('option', { disabled: true, selected: model.newEorReason.title === '', value: '' }, '-'),
            eorReasonTypes.filter((reason) => reason.category === model.newEorReason.category)
                .map((reason, index) => h(
                    `option#eorTitle${index}`,
                    { value: reason.title },
                    reason.title || '(empty)',
                )),
        ]),
        h('input.w-40.form-control', {
            placeholder: 'Description',
            type: 'text',
            oninput: ({ target }) => {
                model.newEorReason.description = target.value;
                model.notify();
            },
        }),
    ]);
}