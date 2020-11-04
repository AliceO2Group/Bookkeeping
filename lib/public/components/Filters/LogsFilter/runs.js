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

const RUNS_LIMIT = 5;

/**
 * Radio button to toggle the filter operation
 * @param {Object} model The global model object
 * @return {vnode} The filter operation radio button elements
 */
const runFilterOperationRadioButtons = (model) => h('.form-group-header.flex-row', ['AND', 'OR'].map((operation) =>
    h('.form-check.mr2', [
        h('input.form-check-input', {
            onclick: () => model.logs.setRunFilterOperation(operation),
            id: `runFilterOperationRadioButton${operation}`,
            checked: operation === model.logs.getRunFilterOperation(),
            type: 'radio',
            name: 'operationRadioButtons',
        }),
        h('label.form-check-label', {
            for: `runFilterOperationRadioButton${operation}`,
        }, operation),
    ])));

/**
 * Creates checkboxes for the run filter subcomponent
 * @param {Object} model The global model object
 * @return {*[]} A collection of checkboxes to toggle table rows by runs
 */
const runsFilter = (model) => {
    const runs = model.runs.getRuns().payload;

    if (runs) {
        const checkboxes = runs.map((run, index) => {
            const isChecked = model.logs.isRunInFilter(run.id);
            return h('.form-check', [
                h('input.form-check-input', {
                    onclick: () => isChecked ? model.logs
                        .removeRunFromFilter(run.id) : model.logs.addRunToFilter(run.id),
                    id: `runCheckbox${index + 1}`,
                    type: 'checkbox',
                    checked: isChecked,
                }),
                h('label.flex-row.items-center.form-check-label', {
                    for: `runCheckbox${index + 1}`,
                }, run.id),
            ]);
        });

        if (checkboxes.length <= RUNS_LIMIT) {
            return [runFilterOperationRadioButtons(model), ...checkboxes];
        } else {
            const showMoreFilters = model.logs.shouldShowMoreRuns();
            const toggleFilters = h('button.btn.btn-primary.mv1#toggleMoreruns', {
                onclick: () => model.logs.toggleMoreRuns(),
            }, ...showMoreFilters ? [iconMinus(), ' Less runs'] : [iconPlus(), ' More runs']);

            const slicedCheckboxes = showMoreFilters ? checkboxes : checkboxes.slice(0, RUNS_LIMIT);
            slicedCheckboxes.splice(RUNS_LIMIT, 0, toggleFilters);

            return [runFilterOperationRadioButtons(model), ...slicedCheckboxes];
        }
    }
    return null;
};

export default runsFilter;
