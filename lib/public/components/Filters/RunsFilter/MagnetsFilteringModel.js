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

import { FilterModel } from '../common/FilterModel.js';
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
    console.log(value);
    
    const [l3, dipole] = value.split('/').map((str) => parseFloat(str.slice(0, -2)));
    return { l3, dipole };
};


/**
 * AliceL3AndDipoleFilteringModel
 */
export class MagnetsFilteringModel extends FilterModel {
    /**
     * Constructor
     *
     * @param {ObservableData<RemoteData<MagnetsCurrentLevels[], ApiError>>} magnetsCurrentLevels$ observable remote data of magnets current
     * levels
     */
    constructor(magnetsCurrentLevels$) {
        super();
        this._selectionDropdownModel = new ObservableBasedSelectionDropdownModel(magnetsCurrentLevels$, magnetsCurrentLevelsToKey, { multiple: false });
        this._addSubmodel(this._selectionDropdownModel);
    }

    /**
     * @inheritDoc
     */
    reset() {
        this._selectionDropdownModel.reset();
    }

    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._selectionDropdownModel.isEmpty;
    }

    /**
     * @inheritDoc
     */
    get normalized() {
        const selected = this._selectionDropdownModel.selected[0];
        return keyToMagnetsCurrentLevels(selected);
    }

    /**
     * Sets selected options based on a comma-seperated string.
     * Accounts for the options being either RemoteData or an array.
     *
     * @return {string}
     */
    set normalized(value) {
        this._selectionDropdownModel.normalized = magnetsCurrentLevelsToKey(value).value;
    }

    /**
     * Return the underlying selection dropdown model
     *
     * @return {SelectionDropdownModel} the dropdown model
     */
    get selectionDropdownModel() {
        return this._selectionDropdownModel;
    }
}
