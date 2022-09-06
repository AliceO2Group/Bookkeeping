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
 * Handle an operator change event
 *
 * @callback operatorChangeHandler
 *
 * @param {string} operator the new operator value
 *
 * @return {*}
 */

/**
 * Wrap a given input inside a comparison operator filter, prefixing the input by an operator selector
 *
 * @param {*} limitInput the input for the limit value (the one to wrap)
 * @param {*} currentLimit the current limit value
 * @param {operatorChangeHandler} onOperatorChange callback called when the operator changes
 * @param {*} [operatorAttributes] the list of attributes to apply on the operator selector (note that value and
 *     onchange attribute are override)
 *
 * @return {vnode} the filter component
 */
export const comparisonOperatorFilter = (limitInput, currentLimit, onOperatorChange, operatorAttributes = {}) => h('.flex-row.g3', [
    h('', h('select.form-control', {
        ...operatorAttributes,
        value: currentLimit,
        onchange: (e) => onOperatorChange(e.target.value),
    }, ['<', '<=', '=', '>=', '>'].map((operator) => h('option', {
        value: operator,
    }, operator)))), limitInput,
]);
