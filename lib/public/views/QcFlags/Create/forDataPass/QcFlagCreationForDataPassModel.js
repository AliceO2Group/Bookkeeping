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
import { getRemoteDataSlice } from '../../../../utilities/fetch/getRemoteDataSlice.js';
import { ObservableData } from '../../../../utilities/ObservableData.js';
import { CreationModel } from '../../../../models/CreationModel.js';
import { QcFlagCreationModel } from '../QcFlagCreationModel.js';

/**
 * QC Flag For Data Pass Creation model
 */
export class QcFlagCreationForDataPassModel extends CreationModel {
    /**
     * Constructor
     * @param {number} dataPassId id of target data pass
     * @param {Map<number, number[]>} runNumberDetectorsMap map between runs and the detectors on which QC flag should be created
     * @param {function(number,*): void} onCreationSuccess callback in case of successful QC flag creation
     */
    constructor(
        dataPassId,
        runNumberDetectorsMap,
        onCreationSuccess,
    ) {
        super('/api/qcFlags', ({ id }) => onCreationSuccess(id));

        this._dataPassId = dataPassId;
        this._dataPass$ = new ObservableData(RemoteData.notAsked());
        this._dataPass$.bubbleTo(this);

        this._fetchDataPass();

        this._qcFlagCreationModel = RemoteData.loading();
        QcFlagCreationModel.fromRunNumberDetectorsMap(runNumberDetectorsMap).then(
            (qcFlagCreationModel) => {
                this._qcFlagCreationModel = RemoteData.success(qcFlagCreationModel);
                qcFlagCreationModel.bubbleTo(this);
                this.notify();
            },
            (error) => {
                this._qcFlagCreationModel = RemoteData.failure({ title: error.message });
                this.notify();
            },
        );
    }

    /**
     * @inheritDoc
     */
    _getSerializableData(options = {}) {
        const serialized = {
            dataPassId: this._dataPassId,
            ...this._qcFlagCreationModel.match({
                Success: ({ normalized }) => normalized,
                Other: {},
            }),
        };

        if (options?.verify) {
            serialized.verify = true;
        }

        return serialized;
    }

    /**
     * @inheritDoc
     */
    _initOrResetData() {
        this._qcFlagCreationModel?.match({
            Success: (qcFlagCreationModel) => qcFlagCreationModel.reset(),
            Other: () => {
                // Nothing to init or reset
            },
        });
    }

    /**
     * @inheritDoc
     */
    isValid() {
        return this._qcFlagCreationModel.match({
            Success: (qcFlagCreationModel) => qcFlagCreationModel.isValid(),
            Other: () => false,
        });
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

    /**
     * Return the QC flag creation model
     *
     * @return {RemoteData<QcFlagCreationModel, ApiError>} the model
     */
    get qcFlagCreationModel() {
        return this._qcFlagCreationModel;
    }
}
