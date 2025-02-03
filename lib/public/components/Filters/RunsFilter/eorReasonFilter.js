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
import { eorReasonFilterComponent } from '../../runEorReasons/runEorReasonSelection.js';

/**
 * Displays the eorReasonSelectionComponent if the eor reason types have been successfully fetched. Otherwise, displays an appropriate message
 *
 * @param {EorReasonFilterModel} eorReasonFilterModel the model responsible for the run details overview.
 * @return {vnode} the appropriate vnode based on the status of remote data.
 */
export const eorReasonFilter = (eorReasonFilterModel) => {
    const { eorReasonTypes: eorReasonTypesRemoteData } = eorReasonFilterModel;

    return eorReasonTypesRemoteData.match({
        NotAsked: () => null,
        Loading: () => 'EOR reason types loading...',
        Success: (eorReasonTypes) => eorReasonFilterComponent(eorReasonFilterModel, eorReasonTypes),
        Failure: () => h('.danger', 'Failure fetching EOR reason types'),
    });
};
