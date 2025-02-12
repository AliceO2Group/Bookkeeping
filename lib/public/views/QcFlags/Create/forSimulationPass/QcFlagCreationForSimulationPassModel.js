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

/**
 * QC Flag For Simulation Pass Creation model
 */
export class QcFlagCreationForSimulationPassModel extends QcFlagCreationModel {
    /**
     * Constructor
     * @param {Object} targetEntitiesIdentifiers target entities identifiers
     * @param {number} targetEntitiesIdentifiers.runNumber runNumber of target run
     * @param {number} targetEntitiesIdentifiers.dplDetectorId id of target dpl detector
     * @param {number} targetEntitiesIdentifiers.simulationPassId id of target simulation pass pass
     * @param {function(number,*)} onCreationSuccess callback in case of successful QC flag creation
     */
    constructor({
        runNumber,
        dplDetectorId,
        simulationPassId,
    }, onCreationSuccess) {
        super({ runNumber, dplDetectorId }, onCreationSuccess);
        this._simulationPassId = simulationPassId;
        this._simulationPass$ = new ObservableData(RemoteData.notAsked());
        this._simulationPass$.bubbleTo(this);

        this._fetchSimulationPass();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _getSerializableData() {
        return {
            ...super._getSerializableData(),
            simulationPassId: this._simulationPassId,
        };
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
}
