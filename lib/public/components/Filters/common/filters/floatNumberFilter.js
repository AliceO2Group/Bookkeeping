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

import { selectionDropdown } from '../../../common/selection/dropdown/selectionDropdown.js';
import { h } from '/js/src/index.js';

/**
 * Render filter of float number with operator selection
 *
 * @param {FloatComparisonFilterModel} floatComparisonFilterModel filter model
 * @param {object} configuration configuration
 * @param {string} configuration.selectionPrefix prefix of inputs' identifiers
 *
 * @return {Component} the component
 */
export const floatNumberFilter = (floatComparisonFilterModel, configuration) => {
    const { selectorPrefix } = configuration;

    return h('.flex-row.g3', [
        selectionDropdown(floatComparisonFilterModel.operatorSelectionModel, { selectorPrefix, searchEnabled: false }),
        h('input.flex-grow', {
            id: `${selectorPrefix}-value-input`,
            type: 'number',
            min: 0,
            value: floatComparisonFilterModel.operandInputModel.value,
            step: 0.0001,
            oninput: (e) => floatComparisonFilterModel.operandInputModel.update(e.target.value),
        }, ''),
    ]);
};
