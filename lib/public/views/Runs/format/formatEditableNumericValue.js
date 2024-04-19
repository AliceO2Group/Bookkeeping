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

import { formatFloat } from '../../../utilities/formatting/formatFloat.js';
import { h } from '/js/src/index.js';

/**
 * Format a editable numeric property of run
 *
 * @param {Run} run run
 * @param {string} propertyName updateable property name
 * @param {RunDetailsModel} runDetailsModel details model
 * @param {number} [options.inputDecimals = 3] precision of input value
 * @param {number} [options.displayDecimals = 3] precision of displayed value
 * @return {Component} display or input
 */
export const formatEditableNumericValue = (
    run,
    propertyName,
    runDetailsModel,
    { inputDecimals = 3, displayDecimals = 3, unit = null } = {},
) => {
    if (runDetailsModel.isEditModeEnabled) {
        return h('.flex-row.g1', [
            h('input.form-control', {
                type: 'number',
                step: Math.pow(10, -inputDecimals),
                value: runDetailsModel.runPatch.formData[propertyName],
                oninput: (e) => runDetailsModel.runPatch.patchFormData({ [propertyName]: parseFloat(e.target.value) || null }),
            }),
            unit ? h('', unit) : null,
        ]);
    } else {
        const value = run[propertyName];
        return value !== null && value !== undefined ? h('.flex-row.g1', [
            formatFloat(run[propertyName], { precision: displayDecimals }),
            unit ? h('', unit) : null,
        ]) : '-';
    }
};
