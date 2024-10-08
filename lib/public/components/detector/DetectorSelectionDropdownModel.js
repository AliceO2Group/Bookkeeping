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

import { SelectionDropdownModel } from '../common/selection/dropdown/SelectionDropdownModel.js';
import { RemoteData } from '/js/src/index.js';

/**
 * Model storing state of a selection of detectors picked from the list of all the existing detectors
 */
export class DetectorSelectionDropdownModel extends SelectionDropdownModel {
    /**
     * Constructor
     *
     * @param {ObservableData<RemoteData<Detector[]>>} observableDetectors observable remote data of detectors list
     */
    constructor(observableDetectors) {
        super({ availableOptions: RemoteData.loading() });
        observableDetectors.observe(() => {
            this.setAvailableOptions(observableDetectors.getCurrent().apply({
                Success: (detectors) => detectors.map(({ name }) => ({ value: name })),
            }));
        });
    }
}
