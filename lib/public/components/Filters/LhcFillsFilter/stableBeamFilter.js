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
import { switchInput } from '../../common/form/switchInput.js';
import radiobutton from '../../common/form/inputs/RadioButton.js';

/**
 * Display a toggle switch or radio buttons to filter stable beams only
 *
 * @param {LhcFillsOverviewModel} lhcFillsOverviewModel the overview model
 * @param {boolean} radioButtonMode define whether or not to return radio buttons or a switch.
 * @returns {Component} the toggle switch
 */
export const toggleStableBeamOnlyFilter = (lhcFillsOverviewModel, radioButtonMode = false) => {
    const isStableBeamsOnly = lhcFillsOverviewModel.getStableBeamsOnly();
    const name = 'stableBeamsOnlyRadio';
    const label1 = 'OFF';
    const label2 = 'ON';
    if (radioButtonMode) {
        return h('.form-group-header.flex-row.w-100', [
            radiobutton({
                label: label1,
                isChecked: isStableBeamsOnly === false,
                action: () => lhcFillsOverviewModel.setStableBeamsFilter(false),
                name: name,
            }),
            radiobutton({
                label: label2,
                isChecked: isStableBeamsOnly === true,
                action: () => lhcFillsOverviewModel.setStableBeamsFilter(true),
                name: name,
            }),
        ]);
    } else {
        return switchInput(isStableBeamsOnly, (newState) => {
            lhcFillsOverviewModel.setStableBeamsFilter(newState);
        }, { labelAfter: 'STABLE BEAM ONLY' });
    }
};
