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
 * Returns a component providing checkboxes for all the available choices of combination operator
 *
 * @param {CombinationOperatorChoiceModel} combinationOperatorModel the model to store the choice's state
 * @param {Object} [configuration] the component's configuration
 * @param {Object} [configuration.selectorPrefix] a selector prefix used to generate DOM selectors
 * @return {Component} the choice component
 */
export const combinationOperatorChoiceComponent = (combinationOperatorModel, configuration) => {
    let { selectorPrefix = '' } = configuration || {};
    if (selectorPrefix && !/-$/.exec(selectorPrefix)) {
        selectorPrefix = `${selectorPrefix}-`;
    }
    return h(
        '.form-group-header.flex-row',
        // Available options are always an array
        combinationOperatorModel.availableOptions.map((option) => h('.form-check.mr2', [
            h('input.form-check-input', {
                onclick: () => combinationOperatorModel.select(option),
                id: `${selectorPrefix}combination-operator-radio-button-${option.value}`,
                checked: combinationOperatorModel.isSelected(option),
                type: 'radio',
                name: selectorPrefix,
            }),
            h('label.form-check-label', {
                for: `${selectorPrefix}combination-operator-radio-button-${option.value}`,
            }, option.label),
        ])),
    );
};
