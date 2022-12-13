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

const SEPARATOR = ',';

/**
 * @callback commaSeparatedValuesFilterChangeHandler
 *
 * @param {{raw: string, values: string[]}} newFilter the raw values in the input alongside with the parsed array of values
 *
 * @return {void}
 */

/**
 * Returns a filter component to filter on a comma separated value list of elements
 *
 * The coma separated list of elements is returned as an array. Each item is parsed (default parse function simply trim and remove empty strings)
 * Any item parsed to null or undefined is removed
 *
 * @param {CommaSeparatedValuesFilterModel} filterModel the model for this filter
 * @param {function} parseValue an optional function applied on every value before to return them. As a default,  convert empty strings to null
 *
 * @return {vnode} the filter component
 */
export const commaSeparatedValuesFilter = (filterModel, parseValue = (value) => value === '' ? null : value) => {
    // eslint-disable-next-line require-jsdoc
    const handleInput = (e) => {
        const { value } = e.target;
        filterModel.update(
            value,
            value.split(SEPARATOR)
                .map((item) => parseValue(item.trim()))
                .filter((item) => item !== null && item !== undefined),
        );
    };

    return h('input', {
        value: filterModel.raw,
        oninput: handleInput,
    });
};
