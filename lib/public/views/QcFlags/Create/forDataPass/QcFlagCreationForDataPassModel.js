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
import { QcFlagCreationModel } from '../QcFlagCreationModel.js';
import { getRemoteDataSlice } from '../../../../utilities/fetch/getRemoteDataSlice.js';
import { ObservableData } from '../../../../utilities/ObservableData.js';

/**
 * QC Flag For Data Pass Creation model
 */
export class QcFlagCreationForDataPassModel extends QcFlagCreationModel {
    /**
     * Constructor
     * @param {Object} parameters target entities identifiers
     * @param {number} parameters.dataPassId id of target data pass
     * @param {Array<{runNumber: number, detectorIds: number[]}>} parameters.runNumberDetectorMap of objects with run number and detector ids
     * @param {function(number,*)} onCreationSuccess callback in case of successful QC flag creation
     */
    constructor({
        dataPassId,
        runNumberDetectorMap,
    }, onCreationSuccess) {
        super({ runNumberDetectorMap }, onCreationSuccess);

        this._dataPassId = dataPassId;
        this._dataPass$ = new ObservableData(RemoteData.notAsked());
        this._dataPass$.bubbleTo(this);

        this._fetchDataPass();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _getSerializableData() {
        return {
            ...super._getSerializableData(),
            dataPassId: this._dataPassId,
        };
    }

    /**
     * Fetch data pass for which QC flag is to be created
     * @return {Promise<void>} promise
     */
    async _fetchDataPass() {
        this._dataPass$.setCurrent(RemoteData.loading());
        try {
            const { items: [dataPass] = [] } = await getRemoteDataSlice(`/api/dataPasses?filter[ids][]=${this._dataPassId}`);
            this._dataPass$.setCurrent(RemoteData.success(dataPass));
        } catch (error) {
            this._dataPass$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Get current data pass which QC flag is to be created
     */
    get dataPass() {
        return this._dataPass$.getCurrent();
    }

    /**
     * Data pass id getter
     * @return {number} current data pass id
     */
    get dataPassId() {
        return this._dataPassId;
    }
}
