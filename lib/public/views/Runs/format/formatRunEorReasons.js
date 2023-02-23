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

import { h, iconTrash } from '/js/src/index.js';
import { iconPlus } from '/js/src/icons.js';

/**
 * Build a table cell with formatted cells. If editMode is:
 * * enabled: build widgets to allow user to remove existing reasons or add new ones
 * * disabled: display current eorReasons
 * @param {RunDetailsModel} runDetailsModel the model storing the run details state
 * @param {Array<object>} eorReasons - List of eor reasons for a particular run
 * @returns {Component} Return a formatted cell for eorReasons
 */
export const formatRunEorReasons = (runDetailsModel, eorReasons) => {
    if (!runDetailsModel.isEditModeEnabled) {
        return h('.w-80.flex-column.items-end', [
            eorReasons.map(({ category, title, description }) => {
                const titleString = title ? ` - ${title}` : '';
                const descriptionString = description ? ` - ${description}` : '';
                return h('w-wrapped', `${category} ${titleString} ${descriptionString}`);
            }),
        ]);
    }
    const { reasonTypes } = runDetailsModel;
    const reasonTypeCategories = [];
    if (reasonTypes.isSuccess()) {
        reasonTypes.payload.map((reason) => reason.category).forEach((category) => {
            if (!reasonTypeCategories.includes(category)) {
                reasonTypeCategories.push(category);
            }
        });
    }
    return h('.w-80.flex-column.items-end', [
        reasonTypes.isSuccess() && h('.flex-row', [
            h('select.w-30.form-control', {
                onchange: ({ target }) => {
                    runDetailsModel.eorNewReason.category = target.value;
                    runDetailsModel.eorNewReason.title = '';
                    runDetailsModel.notify();
                },
            }, [
                h('option', { disabled: true, selected: runDetailsModel.eorNewReason.category === '', value: '' }, '-'),
                reasonTypeCategories.map((category, index) => h(`option#eorCategory${index}`, {
                    value: category,
                }, category)),
            ]),
            h('select.w-30.form-control', {
                onchange: ({ target }) => {
                    runDetailsModel.eorNewReason.title = target.value;
                    runDetailsModel.notify();
                },
            }, [
                h('option', { disabled: true, selected: runDetailsModel.eorNewReason.title === '', value: '' }, '-'),
                reasonTypes.payload.filter((reason) => reason.category === runDetailsModel.eorNewReason.category)
                    .map((reason, index) => h(`option#eorTitle${index}`, {
                        value: reason.title,
                    }, reason.title || '(empty)')),
            ]),
            h('input.w-40.form-control', {
                placeholder: 'Description',
                type: 'text',
                oninput: ({ target }) => {
                    runDetailsModel.eorNewReason.description = target.value;
                    runDetailsModel.notify();
                },
            }),
            h('label.ph1.actionable-icon', {
                onclick: () => runDetailsModel.addEorReasonChange(),
            }, iconPlus()),
        ]),
        eorReasons.map(({ id, category, title, description }) => {
            const titleString = title ? ` - ${title}` : '';
            const descriptionString = description ? ` - ${description}` : '';
            return h('.flex-row', [
                h('w-wrapped', `${category} ${titleString} ${descriptionString}`),
                h(`label.danger.ph1.actionable-icon#trashReason${id}`, {
                    onclick: () => {
                        const currentEorReasons = runDetailsModel.runChanges.eorReasons;
                        const index = currentEorReasons.findIndex((eorReason) => eorReason.id === id);
                        currentEorReasons.splice(index, 1);
                        runDetailsModel.runChanges = { key: 'eorReasons', value: currentEorReasons };
                        runDetailsModel.notify();
                    },
                }, iconTrash()),
            ]);
        }),
    ]);
};
