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

import { runTypeToOption } from './runTypeToOption.js';
import { FilterModel } from '../Filters/common/FilterModel.js';
import { ObservableBasedSelectionDropdownModel } from '../detector/ObservableBasedSelectionDropdownModel.js';

/**
 * Model storing state of a selection of run types picked from the list of all the existing run types
 */
export class RunTypesFilterModel extends FilterModel {
    /**
     * Constructor
     *
     * @param {ObservableData<RemoteData<RunType[], ApiError>>} runTypes$ observable remote data of run types list
     */
    constructor(runTypes$) {
        super();
        this._selectionDropDownModel = new ObservableBasedSelectionDropdownModel(runTypes$, runTypeToOption);
        this._addSubmodel(this._selectionDropDownModel);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        this._selectionDropDownModel.reset();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._selectionDropDownModel.isEmpty;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get normalized() {
        return this._selectionDropDownModel.selected;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    hydrate(normalizedValues) {
        return this._selectionDropDownModel.setSelectedOptions(normalizedValues.map((value) => parseInt(value, 10)));
    }

    /**
     * Return the underlying selection dropdown model
     *
     * @return {SelectionDropdownModel} the selection dropdown model
     */
    get selectionDropdownModel() {
        return this._selectionDropDownModel;
    }
}
