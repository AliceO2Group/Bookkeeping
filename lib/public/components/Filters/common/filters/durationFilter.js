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
 * @callback durationFilterChangeHandler
 * @param {{operator: string, limit: (number|number)}} newFilter the new filter value including the limit duration in milliseconds
 */

/**
 * Returns a component which provide a duration filter, allowing to choose a limit and the comparison operator to apply
 *
 * @param {DurationFilterModel} filterModel the filter's model
 * @param {*} options eventual options to configure the filter: use `operatorAttributes` to define the attributes of
 *     the operator selection component and `limitAttributes` to define the attributes of the limit input component
 *
 * @return {vnode} the component
 */
export const durationFilter = (filterModel, options) => {
    const { operator, limit } = filterModel;
    const { operatorAttributes = {}, limitAttributes = {} } = options;

    const { hours, minutes, seconds } = limit || { hours: null, minutes: null, seconds: null };

    // Number input are not controlled because the e.target.value do not reflect what is actually written in the input

    const durationInput = h(
        '.flex-row.flex-grow.g1.items-center',
        limitAttributes,
        [
            h('input.flex-grow.text-center', {
                type: 'number',
                min: 0,
                placeholder: 'HH',
                value: hours,
                oninput: (e) => filterModel.update({ limit: { hours: e.target.validity.valid ? e.target.value : undefined } }),
            }),
            ':',
            h('input.flex-grow.text-center', {
                type: 'number',
                min: 0,
                max: 59,
                placeholder: 'MM',
                value: minutes,
                oninput: (e) => filterModel.update({ limit: { minutes: e.target.validity.valid ? e.target.value : undefined } }),
            }),
            ':',
            h('input.flex-grow.text-center', {
                type: 'number',
                min: 0,
                max: 59,
                placeholder: 'SS',
                value: seconds,
                oninput: (e) => filterModel.update({ limit: { seconds: e.target.validity.valid ? e.target.value : undefined } }),
            }),
        ],
    );

    return comparisonOperatorFilter(
        durationInput,
        operator,
        (newOperator) => filterModel.update({ operator: newOperator }),
        operatorAttributes,
    );
};
