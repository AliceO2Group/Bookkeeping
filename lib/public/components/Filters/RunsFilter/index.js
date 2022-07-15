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
 * Render a complete filter collection
 * @param {Model} model The global model object
 * @param {Object} columns The columns representing the table
 * @return {vnode} The full collection of filters accessible through various input forms
 */
const filtersRuns = (model, columns) => h('.w-100.shadow-level1.br2', [
    h('.f4.ph2', 'Filters'),
    Object.values(columns).reduce((accumulator, column) => {
        if (column.filter) {
            accumulator.push([
                h('.flex-row.items-baseline.ph3.pv1', [
                    h('.w-30.f5', column.name),
                    h('.w-70', typeof column.filter === 'function' ? column.filter(model) : column.filter),
                ]),
            ]);
        }
        return accumulator;
    }, []),
    h('.p2', h('button.btn.btn-danger.mt2', {
        disabled: !model.runs.isAnyFilterActive(),
        onclick: () => model.runs.resetRunsParams(),
    }, 'Reset all filters')),
]);

export default filtersRuns;
