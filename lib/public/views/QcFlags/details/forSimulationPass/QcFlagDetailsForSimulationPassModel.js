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

import { ObservableData } from '../../../../utilities/ObservableData.js';
import { getRemoteData } from '../../../../utilities/fetch/getRemoteData.js';
import { QcFlagDetailsModel } from '../QcFlagDetailsModel.js';
import { RemoteData } from '/js/src/index.js';

/**
 * QC Flag details for simulation pass model
 */
export class QcFlagDetailsForSimulationPassModel extends QcFlagDetailsModel {
    /**
     * Constructor
     *
     * @param {object} parameters parameters for the model
     * @param {number} [parameters.id] QC flag id
     * @param {number} parameters.simulationPassId simulation pass id
     * @param {function} onDeleteSuccess callback in case the flag is successfully deleted
     */
    constructor(
        { id, simulationPassId },
        onDeleteSuccess,
    ) {
        super({ id }, onDeleteSuccess);
        this._simulationPassId = simulationPassId;
        this._simulationPass$ = new ObservableData(RemoteData.notAsked());
        this._simulationPass$.bubbleTo(this);
        this._fetchSimulationPass();
    }

    /**
     * Fetch simulation pass data which QC flags are fetched
     * @return {Promise<void>} promise
     */
    async _fetchSimulationPass() {
        this._simulationPass$.setCurrent(RemoteData.loading());
        try {
            const { data: simulationPass } = await getRemoteData(`/api/simulationPasses/${this._simulationPassId}`);
            this._simulationPass$.setCurrent(RemoteData.success(simulationPass));
        } catch (error) {
            this._simulationPass$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Get current simulation pass which QC flags are fetched
     * @return {RemoteData<SimulationPass>} simulation pass remote data
     */
    get simulationPass() {
        return this._simulationPass$.getCurrent();
    }
}
