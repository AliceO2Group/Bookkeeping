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

import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { QcFlagsOverviewModel } from '../Overview/QcFlagsOverviewModel.js';
import { ObservableData } from '../../../utilities/ObservableData.js';

/**
 * Quality Control Flags For Simulation Pass overview model
 *
 * @implements {OverviewModel}
 */
export class QcFlagsForSimulationPassOverviewModel extends QcFlagsOverviewModel {
    /**
     * The constructor of the Overview model object
     */
    constructor() {
        super();
        this._simulationPass$ = new ObservableData(RemoteData.notAsked());
        this._simulationPass$.bubbleTo(this);
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        return buildUrl('/api/qcFlags/perSimulationPass', {
            simulationPassId: this._simulationPassId,
            runNumber: this._runNumber,
            dplDetectorId: this._dplDetectorId,
        });
    }

    /**
     * @inheritdoc
     */
    async load() {
        await super.load();
        this._fetchSimulationPass();
    }

    /**
     * Fetch Simulaiton Pass data which QC flags are fetched
     * @return {Promise<void>} promise
     * @private
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
     * Set id of simulation pass which for QC flags should be fetched
     * @param {number} simulationPassId simulation pass id
     */
    set simulationPassId(simulationPassId) {
        this._simulationPassId = simulationPassId;
    }

    /**
     * Get current simulation pass which QC flags are fetched
     * @return {RemoteData<SimulationPass>} simulation pass remote data
     */
    get simulationPass() {
        return this._simulationPass$.getCurrent();
    }

    /**
     * Return the id of the current simulation pass
     *
     * @return {number} the simulation pass id
     */
    get simulationPassId() {
        return this._simulationPassId;
    }
}
