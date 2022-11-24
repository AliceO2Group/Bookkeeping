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
import { detectorsProvider } from '../../services/detectors/detectorsProvider.js';

/**
 * Model storing state of a selection of detectors picked from the list of all the existing detectors
 */
export class DetectorSelectionDropdownModel extends SelectionDropdownModel {
    /**
     * Constructor
     */
    constructor() {
        super(RemoteData.loading());
        detectorsProvider.getAll().then(
            (detectors) => {
                this.availableOptions = RemoteData.success(detectors.map(({ name }) => ({ value: name })));
                this.notify();
            },
            (errors) => {
                this.availableOptions = RemoteData.failure(errors);
                this.notify();
            },
        );
    }
}
