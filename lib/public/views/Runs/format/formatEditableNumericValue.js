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
 * Format a editable numeric property
 *
 * @param {Run} run run
 * @param {string} propertyName property to update
 * @param {RunDetailsModel} runDetailsModel details model
 * @return {Component} display or input
 */
export const formatEditableNumericValue = (run, propertyName, runDetailsModel) => {
    if (runDetailsModel.isEditModeEnabled) {
        return h('input.form-control', {
            type: 'number',
            step: 0.000001,
            onchange: (e) => runDetailsModel.runPatch.patchFormData({ [propertyName]: e.target.value }),
        });
    } else {
        const value = run[propertyName];
        return value !== null && value !== undefined ? h('', run[propertyName]) : '-';
    }
};
