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
import { eorReasonSelectionComponent } from '../../runEorReasons/runEorReasonSelection.js';

/**
 * Displays the eorReasonSelectionComponent if the eor reason types have been successfully fetched.
 * Otherwise displays an appropriate message
 * @param {Object} eorReasonsFilterModel the model responsible for the run details overview.
 * @returns {vnode} the appropriate vnode based on the status of remote data.
 */
export const runReasonsSelection = (eorReasonsFilterModel) => {
    const { eorReasonTypes: eorReasonTypesRemoteData } = eorReasonsFilterModel;

    return eorReasonTypesRemoteData.match({
        NotAsked: () => null,
        Loading: () => 'EOR reason types loading...',
        Success: (eorReasonTypes) => eorReasonSelectionComponent(eorReasonsFilterModel, eorReasonTypes),
        Failure: () => h('.danger', 'Failure fetching EOR reason types'),
    });
};

/**
 * Returns the EOR reason filter component
 * @param {RunModel} runModel the run model object
 * @return {vnode} A series of dropdowns and a text field allowing the user to filter by EOR reason
 */
export const eorReasonFilter = (runModel) => runReasonsSelection(runModel.eorReasonsFilterModel);
