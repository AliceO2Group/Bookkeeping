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

import { ObservableBasedSelectionDropdownModel } from '../../detector/ObservableBasedSelectionDropdownModel.js';

/**
 * Return the option value corresponding to a given magnets current level
 *
 * @param {MagnetsCurrentLevels} currentLevels the current levels
 * @return {object<value: string>} the option's value
 */
const magnetsCurrentLevelsToKey = ({ l3, dipole }) => ({ value: `${l3}kA/${dipole}kA` });

/**
 * Return the magnets current lever based on a key string
 *
 * @param {object} option string containing the current levels
 * @param {string} option.value string containing the current levels
 * @return {MagnetsCurrentLevels}
 */
const keyToMagnetsCurrentLevels = (value) => {
    const [l3, dipole] = value.split('/').map((str) => parseFloat(str.slice(0, -2)));
    return { l3, dipole };
};

/**
 * AliceL3AndDipoleFilteringModel
 */
export class MagnetsFilteringModel extends ObservableBasedSelectionDropdownModel {
    /**
     * Constructor
     *
     * @param {ObservableData<RemoteData<MagnetsCurrentLevels[], ApiError>>} magnetsCurrentLevels$ observable remote data of magnets current
     * levels
     */
    constructor(magnetsCurrentLevels$) {
        super(magnetsCurrentLevels$, magnetsCurrentLevelsToKey, { multiple: false });
    }

    /**
     * @inheritDoc
     */
    get normalized() {
        const [selectedOption] = this.selected;
        return keyToMagnetsCurrentLevels(selectedOption);
    }

    /**
     * Sets selected options based on an object containing l3 and dipole fields.
     * Accounts for the options being either RemoteData or an array.
     *
     * @param {MagnetsCurrentLevels} value the magnets current levels
     * @param {number} value.l3 the L3 current level in kA
     * @param {number} value.dipole the dipole current level in kA
     */
    set normalized(value) {
        super.normalized = magnetsCurrentLevelsToKey(value).value;
    }
}
