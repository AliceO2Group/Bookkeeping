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
 * @param {{operator: string, limit: (number|null)}|null} currentValue the operator to use to compare the limit to the actual
 *     values
 * @param {filterChangeHandler} onChange callback called any time the operator OR the limit changes
 * @param {*} options eventual options to configure the filter: use `operatorAttributes` to define the attributes of
 *     the operator selection component and `limitAttributes` to define the attributes of the limit input component
 * @return {vnode} the component
 */
export const amountFilter = (currentValue, onChange, options) => {
    const { operator, limit } = currentValue || { operator: '=', limit: null };
    const { operatorAttributes = {}, limitAttributes = {} } = options;

    // eslint-disable-next-line require-jsdoc
    const updateFilter = ({ newOperator, newLimit }) => {
        onChange({
            operator: newOperator || operator,
            limit: newLimit !== undefined ? newLimit : limit,
        });
    };

    return comparisonOperatorFilter(h('input.flex-grow', {
        type: 'number',
        min: 0,
        value: limit,
        oninput: (e) => {
            let newLimit;

            if (e.target.value === '') {
                newLimit = null;
            } else {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                    newLimit = value;
                }
            }

            if (newLimit !== undefined && newLimit !== limit) {
                updateFilter({ newLimit });
            }
        },
        ...limitAttributes,
    }, ''), operator, (newOperator) => updateFilter({ newOperator }), operatorAttributes);
};
