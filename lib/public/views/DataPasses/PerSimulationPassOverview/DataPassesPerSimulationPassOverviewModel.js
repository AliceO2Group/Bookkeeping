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
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { DataPassesOverviewModel } from '../DataPassesOverviewModel.js';

/**
 * Data Passes Per Simulation Pass overview model
 */
export class DataPassesPerSimulationPassOverviewModel extends DataPassesOverviewModel {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._simulationPass = new ObservableData(RemoteData.notAsked());
        this._simulationPass.bubbleTo(this);
    }

    /**
     * Fetch Simulation Pass data which data passes are fetched
     * @return {Promise<void>} promise
     */
    async _fetchSimulationPass() {
        this._simulationPass.setCurrent(RemoteData.loading());
        try {
            const { data: simulationPass } = await getRemoteData(`/api/simulationPasses/${this._simulationPassId}`);
            this._simulationPass.setCurrent(RemoteData.success(simulationPass));
        } catch (error) {
            this._simulationPass.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * @inheritdoc
     */
    async load() {
        this._fetchSimulationPass();
        super.load();
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const { filter, sort } = this.getBaseParams();
        const params = {
            filter: {
                simulationPassIds: [this._simulationPassId],
                ...filter,
            },
            ...sort,
        };

        return buildUrl('/api/dataPasses', params);
    }

    /**
     * Set id of current simulation pass which data passes are fetched
     * @param {number} simulationPassId simulation pass id
     */
    set simulationPassId(simulationPassId) {
        this._simulationPassId = simulationPassId;
    }

    /**
     * Get current simulation pass which data passes are fetched
     */
    get simulationPass() {
        return this._simulationPass.getCurrent();
    }
}
