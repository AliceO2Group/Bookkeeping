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

import { buildUrl, RemoteData } from '/js/src/index.js';
import { QcFlagCreationModel } from '../QcFlagCreationModel.js';
import { getRemoteDataSlice } from '../../../../utilities/fetch/getRemoteDataSlice.js';
import { ObservableData } from '../../../../utilities/ObservableData.js';
import { CreationModel } from '../../../../models/CreationModel.js';

/**
 * QC Flag For Simulation Pass Creation model
 */
export class QcFlagCreationForSimulationPassModel extends CreationModel {
    /**
     * Constructor
     *
     * @param {number} simulationPassId id of target simulation pass
     * @param {Map<number, number[]>} runNumberDetectorsMap map between runs and the detectors on which QC flag should be created
     * @param {function(number,*): void} onCreationSuccess callback in case of successful QC flag creation
     */
    constructor(
        simulationPassId,
        runNumberDetectorsMap,
        onCreationSuccess,
    ) {
        super('/api/qcFlags', ({ id }) => onCreationSuccess(id));

        this._simulationPassId = simulationPassId;
        this._simulationPass$ = new ObservableData(RemoteData.notAsked());
        this._simulationPass$.bubbleTo(this);

        this._fetchSimulationPass();

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
            simulationPassId: this._simulationPassId,
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
     * Initialize or reset the QC flag creation model data
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
     * Fetch the simulation pass for which QC flag is to be created
     *
     * @return {Promise<void>} promise
     */
    async _fetchSimulationPass() {
        this._simulationPass$.setCurrent(RemoteData.loading());
        try {
            const { items: [simulationPass] = [] } = await getRemoteDataSlice(buildUrl(
                '/api/simulationPasses',
                { filter: { ids: [this._simulationPassId] } },
            ));
            this._simulationPass$.setCurrent(RemoteData.success(simulationPass));
        } catch (error) {
            this._simulationPass$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Return the target simulation pass for which QC flag is to be created
     */
    get simulationPass() {
        return this._simulationPass$.getCurrent();
    }

    /**
     * Simulation pass id getter
     * @return {number} current simulation pass id
     */
    get simulationPassId() {
        return this._simulationPassId;
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
