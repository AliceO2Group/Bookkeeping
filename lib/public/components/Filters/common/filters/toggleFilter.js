/**
 * @license
 * Copyright CERN and copyright holders of ALICE Trg. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-Trg.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';
import { switchInput } from '../../../common/form/switchInput.js';
import { radioButton } from '../../../common/form/inputs/radioButton.js';

/**
 * Display a toggle switch or radio buttons for toggle filters
 *
 * @param {ToggleFilterModel} toggleFilterModel a ToggleFilterModel
 * @param {name} toggleFilterModel the name used to identify and label the filter
 * @param {boolean} radioButtonMode define whether or not to return radio buttons or a switch.
 * @returns {Component} the toggle switch
 */
export const toggleFilter = (toggleFilterModel, name, id, radioButtonMode = false) => {
    if (radioButtonMode) {
        return h('.form-group-header.flex-row.w-100', [
            radioButton({
                label: 'OFF',
                isChecked: !toggleFilterModel.isToggled(),
                action: () => toggleFilterModel.toggle(),
                name,
            }),
            radioButton({
                label: 'ON',
                isChecked: toggleFilterModel.isToggled(),
                action: () => toggleFilterModel.toggle(),
                name,
            }),
        ]);
    }

    return switchInput(toggleFilterModel.isToggled(), () => toggleFilterModel.toggle(), { labelAfter: name, id });
};
