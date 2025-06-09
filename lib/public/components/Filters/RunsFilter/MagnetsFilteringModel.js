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
 * @return {string} the option's value
 */
const magnetsCurrentLevelsToOptionValue = ({ l3, dipole }) => `${l3}kA/${dipole}kA`;

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
        this._selectionDropdownModel = new ObservableBasedSelectionDropdownModel(
            magnetsCurrentLevels$,
            (magnetsCurrentLevels) => ({ value: magnetsCurrentLevelsToOptionValue(magnetsCurrentLevels) }),
            { multiple: false },
        );
        this._addSubmodel(this._selectionDropdownModel);

        this._valueToFilteringParamsMap = new Map();
        magnetsCurrentLevels$.observe(() => {
            magnetsCurrentLevels$.getCurrent().match({

                /**
                 * Fill map indexing current level by their corresponding value
                 *
                 * @param {MagnetsCurrentLevels[]} currentLevels the current levels to map
                 * @return {void}
                 */
                Success: (currentLevels) => {
                    this._valueToFilteringParamsMap = new Map(currentLevels.map(({ l3, dipole }) => [
                        magnetsCurrentLevelsToOptionValue({ l3, dipole }),
                        { l3, dipole },
                    ]));
                },
                Other: () => {
                    this._valueToFilteringParamsMap = new Map();
                },
            });
        });
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        this._selectionDropdownModel.reset();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._selectionDropdownModel.isEmpty;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get normalized() {
        return this._valueToFilteringParamsMap.get(this._selectionDropdownModel.selected[0]) ?? null;
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
