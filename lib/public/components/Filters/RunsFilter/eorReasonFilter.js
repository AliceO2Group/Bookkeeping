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

import { eorReasonSelectionComponent } from '../../runEorReasons/runEorReasonSelection.js';

export const runReasonsSelection = (runDetailsModel) => {
    const { eorReasonTypes: eorReasonTypesRemoteData } = runDetailsModel;

    return eorReasonTypesRemoteData.match({
        NotAsked: () => null,
        Loading: () => 'loading',
        Success: (eorReasonTypes) => eorReasonSelectionComponent(runDetailsModel, eorReasonTypes),
        Failure: () => 'oh no'
    })
}  

/**
 * Returns the author filter component
 * @param {RunModel} runModel the run model object
 * @return {vnode} A text box that lets the user look for logs with a specific author
 */
export const eorReasonFilter = (runModel) => runReasonsSelection(runModel.eorReasonsFilterModel);
