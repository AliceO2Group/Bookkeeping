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
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { SelectionDropdownModel } from '../../common/selection/dropdown/SelectionDropdownModel.js';
import { FilterModel } from '../common/FilterModel.js';

/**
 * AliceL3AndDipoleFilteringModel
 */
export class MagnetsFilteringModel extends FilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._selectionDropdownModel = new SelectionDropdownModel({ multiple: false });
        this._addSubmodel(this._selectionDropdownModel);

        this._valueToFilteringParamsMap = new Map();

        getRemoteData('/api/runs/aliceMagnetsCurrentLevels')
            .then(
                ({ data }) => {
                    data.sort((
                        { l3Level: l3LevelA, dipoleLevel: dipoleLevelA },
                        { l3Level: l3LevelB, dipoleLevel: dipoleLevelB },
                    ) => l3LevelA - l3LevelB || dipoleLevelA - dipoleLevelB);

                    const options = [];
                    for (const { l3Level, dipoleLevel } of data) {
                        const value = `${l3Level}kA/${dipoleLevel}kA`;
                        options.push({
                            value,

                        });
                        this._valueToFilteringParamsMap.set(
                            value,
                            {
                                l3: l3Level,
                                dipole: dipoleLevel,
                            },
                        );
                    }
                    this._selectionDropdownModel.setAvailableOptions(RemoteData.success(options));
                },
                (errors) => this._selectionDropdownModel.setAvailableOptions(RemoteData.failure(errors)),
            );
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
