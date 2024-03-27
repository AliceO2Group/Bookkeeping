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
 * Wrap a given input inside a comparison operator filter, prefixing the input by an operator selector
 *
 * @param {Compoenent} operandInput the input for the operand value (the one to wrap)
 * @param {NumericComparisonOperatorSelectionModel} operatorSelectionModel the operator selection model
 * @param {*} [operatorAttributes] the list of attributes to apply on the operator selector (note that value and
 *     onchange attribute are override)
 *
 * @return {ComponenT} the filter component
 */
export const comparisonOperatorFilter = (operandInput, operatorSelectionModel, operatorAttributes = {}) => h('.flex-row.g3', [
    h('', h('select.form-control', {
        ...operatorAttributes,
        value: operatorSelectionModel.selected[0],
        onchange: (e) => operatorSelectionModel.select(e.target.value),
    }, operatorSelectionModel.options?.map(({ value }) => h('option', {
        value,
    }, value)))), operandInput,
]);
