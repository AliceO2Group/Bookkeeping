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
import spinner from '../../../components/common/spinner.js';

/**
 * Build a table cell with formatted cells. If editMode is:
 * * enabled: build widgets to allow user to remove existing reasons or add new ones
 * * disabled: display current eorReasons
 * @param {RunDetailsModel} runDetailsModel the model storing the run details state
 * @returns {Component} Return a formatted cell for eorReasons
 */
export const editRunEorReasons = (runDetailsModel) => {
    const { eorReasonTypes: eorReasonTypesRemoteData } = runDetailsModel;

    let newEorReasonComponent = null;
    return eorReasonTypesRemoteData.match({
        NotAsked: () => null,
        Loading: () => spinner({ size: 2, absolute: false }),

        /**
         * Displays the EOR reasons form
         * @param {ReasonType[]} eorReasonTypes the list of all existing EOR reason types
         * @return {Component} the EOR reasons form
         */
        Success: (eorReasonTypes) => {
            const reasonTypeCategories = [];

            for (const { category } of eorReasonTypes) {
                if (!reasonTypeCategories.includes(category)) {
                    reasonTypeCategories.push(category);
                }
            }

            newEorReasonComponent = h('.flex-row.g2.items-center', [
                h('select.form-control', {
                    onchange: ({ target }) => {
                        runDetailsModel.newEorReason.category = target.value;
                        runDetailsModel.newEorReason.title = '';
                        runDetailsModel.notify();
                    },
                }, [
                    h('option', { disabled: true, selected: runDetailsModel.newEorReason.category === '', value: '' }, '-'),
                    reasonTypeCategories.map((category, index) => h(`option#eorCategory${index}`, {
                        value: category,
                    }, category)),
                ]),
                h('select.form-control', {
                    onchange: ({ target }) => {
                        runDetailsModel.newEorReason.title = target.value;
                        runDetailsModel.notify();
                    },
                }, [
                    h('option', { disabled: true, selected: runDetailsModel.newEorReason.title === '', value: '' }, '-'),
                    eorReasonTypes.filter((reason) => reason.category === runDetailsModel.newEorReason.category)
                        .map((reason, index) => h(
                            `option#eorTitle${index}`,
                            { value: reason.title },
                            reason.title || '(empty)',
                        )),
                ]),
                h('input.form-control', {
                    placeholder: 'Description',
                    type: 'text',
                    oninput: ({ target }) => {
                        runDetailsModel.newEorReason.description = target.value;
                        runDetailsModel.notify();
                    },
                }),
                h('label.ph1.actionable-icon#add-eor-reason', {
                    onclick: () => runDetailsModel.addNewEorReason(),
                }, iconPlus()),
            ]);

            return h('.flex-column.g2.flex-grow', [
                newEorReasonComponent,

                /*
                 * Check explicitly if there ie any eorReason, because if not mithril fails reconciliation and will display the previous vnode
                 * This occurs when adding an EOR reason to a run which do not have any, then click on revert and edit again: the previously
                 * added EOR reason is still displayed
                 */
                runDetailsModel.runPatch.eorReasons.length > 0
                    ? runDetailsModel.runPatch.eorReasons.map((eorReason) => {
                        const { reasonTypeId, description } = eorReason;
                        const { category = '-', title } = eorReasonTypes.find((eorReasonType) => eorReasonType.id === reasonTypeId) || {};
                        const titleString = title ? ` - ${title}` : '';
                        const descriptionString = description ? ` - ${description}` : '';
                        return h(
                            '.flex-row.items-center',
                            {
                                key: `${category} ${titleString} ${descriptionString}`,
                            },
                            [
                                h('label.remove-eor-reason.danger.ph1.actionable-icon', {
                                    onclick: () => runDetailsModel.runPatch.removeEorReason(eorReason),
                                }, iconTrash()),
                                h('.w-wrapped', `${category} ${titleString} ${descriptionString}`),
                            ],
                        );
                    })
                    : null,
            ]);
        },
        Failure: () => h('p.danger', 'Unable to fetch available EOR reasons types.'),
    });
};
