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

import { switchInput } from '../../common/form/switchInput.js';

/**
 * Display a toggle switch to display stable beams only
 *
 * @param {LhcFillsOverviewModel} lhcFillsOverviewModel the overview model
 * @returns {Component} the toggle switch
 */
export const toggleStableBeamOnlyFilter = (lhcFillsOverviewModel) => {
    const isStableBeamsOnly = lhcFillsOverviewModel.getStableBeamsOnly();
    return switchInput(isStableBeamsOnly, (newState) => {
        lhcFillsOverviewModel.setStableBeamsFilter(newState);
    }, { labelAfter: 'STABLE BEAM ONLY' });
};
