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
 * Render filter of float number with operator selection
 *
 * @param {NumericalComparisonFilterModel} numericalComparisonFilterModel filter model
 * @param {object} configuration configuration
 * @param {number} [configuration.step=1] limit's input step
 * @param {string} configuration.selectorPrefix prefix of inputs' selectors
 *
 * @return {Component} the component
 */
export const numericalComparisonFilter = (numericalComparisonFilterModel, configuration) => {
    const { step = 1, selectorPrefix } = configuration;

    return h('.flex-row.g3', [
        h(
            '',
            h(
                'select.form-control',
                {
                    id: `${selectorPrefix}-operator`,
                    value: numericalComparisonFilterModel.operatorSelectionModel.current,
                    onchange: (e) => numericalComparisonFilterModel.operatorSelectionModel.select(e.target.value),
                },
                numericalComparisonFilterModel.operatorSelectionModel.options.map((option) => h(
                    'option',
                    {
                        value: option.value,
                    },
                    option.label || option.value,
                )),
            ),
        ),
        h(
            'input.flex-grow',
            {
                id: `${selectorPrefix}-operand`,
                type: 'number',
                min: 0,
                value: numericalComparisonFilterModel.operandInputModel.raw,
                step,
                oninput: (e) => numericalComparisonFilterModel.operandInputModel.update(e.target.value),
                onchange: (e) => numericalComparisonFilterModel.operandInputModel.update(e.target.value, true),
            },
            '',
        ),
    ]);
};
