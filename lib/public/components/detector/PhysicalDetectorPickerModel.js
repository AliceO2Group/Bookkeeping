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

import { RemoteData } from '/js/src/index.js';
import { detectorsProvider } from '../../services/detectors/detectorsProvider.js';
import { PickerModel } from '../common/selection/picker/PickerModel.js';
import { badge } from '../common/badge.js';

/**
 * Map detector to select options with the detector badge as label
 *
 * @param {Detector} detector detector
 * @return {SelectOption} select option
 */
export const detectorToOption = ({ id, name }) => ({
    value: id,
    label: badge(name),
    rawLabel: name,
});

/**
 * Model storing state of a selection of detectors picked from the list of all physical detectors
 */
export class PhysicalDetectorPickerModel extends PickerModel {
    /**
     * Constructor
     * @param {Detector[]} defaultDetectors default detectors
     */
    constructor(defaultDetectors) {
        super({ multiple: true, availableOptions: RemoteData.loading(), defaultSelection: defaultDetectors.map(detectorToOption) });

        /**
         * Update available options
         * @return {void}
         */
        const updateOptions = () => {
            this.setAvailableOptions(detectorsProvider.physical$.getCurrent().apply({
                Success: (detectors) => detectors.map(detectorToOption),
            }));
        };

        detectorsProvider.physical$.observe(updateOptions);
        updateOptions();
    }
}
