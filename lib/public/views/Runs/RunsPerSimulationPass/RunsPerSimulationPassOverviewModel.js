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
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';
import { RunsOverviewModel } from '../Overview/RunsOverviewModel.js';

/**
 * Runs Per Simulation Pass overview model
 */
export class RunsPerSimulationPassOverviewModel extends RunsOverviewModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);
        this._detectors = RemoteData.notAsked();
    }

    /**
     * Retrieve a list of detector types from detectorsProvider
     *
     * @return {Promise<void>} resolves once the data has been fetched
     */
    async fetchDetectors() {
        this._detectors = RemoteData.loading();
        this.notify();

        try {
            const detectors = await detectorsProvider.getAll();
            this._detectors = RemoteData.success(detectors);
        } catch (error) {
            this._detectors = RemoteData.failure(error);
        }

        this.notify();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load({ simulationPassId } = {}) {
        this._simulationPassId = simulationPassId || this._simulationPassId;
        super.load();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {
            filter: {
                simulationPassIds: [this._simulationPassId],
            },
        };

        return buildUrl(super.getRootEndpoint(), params);
    }

    /**
     * Get current name of lhc period which runs are fetched
     */
    get simulationPassId() {
        return this._simulationPassId;
    }

    /**
     * Get all detectors
     * @return {RemoteData<Detector[]>} detectors
     */
    get detectors() {
        return this._detectors;
    }
}
