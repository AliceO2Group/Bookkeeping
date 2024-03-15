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

import { comparisonOperatorFilter } from './comparisonOperatorFilter.js';
import { h } from '/js/src/index.js';

/**
 * @callback filterChangeHandler
 * @param {{operator: string, limit: (number|number)}|null} newFilter the new filter value
 */

/**
 * Returns a component which provide an amount filter, allowing to choose a limit and the comparison operator to apply
 *
 * @param {NumericFilterModel} numericFilterModel filter model
 * @param {{operatorAttributes: (object|undefined), operandAttributes: (object|undefined)}} options eventual options to configure the filter: use
 *     `operatorAttributes` to define the attributes of the operator selection component and `operandAttributes` to define the attributes of the
 *     operand input component
 *
 * @return {vnode} the component
 */
export const amountFilter = (numericFilterModel, options) => {
    const { operatorSelectionModel } = numericFilterModel;

    return comparisonOperatorFilter(
        h('input.flex-grow', {
            type: 'number',
            min: numericFilterModel.minValue,
            max: numericFilterModel.maxValue,
            value: numericFilterModel.value,
            oninput: (e) => {
                const { value } = e.target;
                if (value === '') {
                    numericFilterModel.value = null;
                } else {
                    numericFilterModel.value = Number(value);
                }
            },
            ...options.operandAttributes,
        }, ''),
        operatorSelectionModel,
        options.operatorAttributes,
    );
};
