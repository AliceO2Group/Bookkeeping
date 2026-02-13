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


import { ObservableBasedSelectionDropdownModel } from '../../detector/ObservableBasedSelectionDropdownModel.js';
import { FilterModel } from '../common/FilterModel.js';

/**
 * Beam mode filter model
 */
export class BeamModeFilterModel extends FilterModel {
    /**
     * Constructor
     *
     * @param {ObservableData<RemoteData<{name: string}, ApiError>>} beamModes$ observable remote data of objects representing beam modes
     */
    constructor(beamModes$) {
        super();
        this._selectionDropDownModel = new ObservableBasedSelectionDropdownModel(beamModes$, ({ name }) => ({ value: name }));
        this._addSubmodel(this._selectionDropDownModel);
    }

    /**
     * @inheritDoc
     */
    reset() {
        this._selectionDropDownModel.reset();
    }
    
    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._selectionDropDownModel.isEmpty;
    }

    /**
     * Return the underlying dropdown model
     *
     * @return {ObservableDropDownModel} the underlying dropdown model
     */
    get dropDownModel() {
        return this._selectionDropDownModel;
    }

    /**
     * @inheritDoc
     */
    get normalized() {
        return this._selectionDropDownModel.selected;
    }
}
