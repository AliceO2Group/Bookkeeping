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
import { RunsOverviewModel } from '../Overview/RunsOverviewModel.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { dplDetectorsProvider } from '../../../services/detectors/dplDetectorsProvider.js';

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
        this._detectors$ = dplDetectorsProvider.physical$;
        this._detectors$.bubbleTo(this);
        this._simulationPass$ = new ObservableData(RemoteData.notAsked());
        this._simulationPass$.bubbleTo(this);
        this._qcSummary$ = new ObservableData(RemoteData.NotAsked());
        this._qcSummary$.bubbleTo(this);
    }

    /**
     * Fetch Simulaiton Pass data which data passes are fetched
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
     * Fetch QC summaries for given data pass
     * @return {Promise<void>} promise
     */
    async _fetchQcSummary() {
        this._qcSummary$.setCurrent(RemoteData.loading());
        try {
            const { data: qcSummary } = await getRemoteData(buildUrl(
                '/api/qcFlags/perSimulationPass/summary',
                { simulationPassId: this._simulationPassId },
            ));
            this._qcSummary$.setCurrent(RemoteData.success(qcSummary));
        } catch (error) {
            this._qcSummary$.setCurrent(RemoteData.failure(error));
        }
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load() {
        this._fetchQcSummary();
        this._fetchSimulationPass();
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
     * Set id of current simulation pass which runs are fetched
     * @param {number} simulationPassId simulation pass id
     */
    set simulationPassId(simulationPassId) {
        this._simulationPassId = simulationPassId;
    }

    /**
     * Get current simulation pass which runs are fetched
     * @return {RemoteData<SimulationPass>} simulation pass remote data
     */
    get simulationPass() {
        return this._simulationPass$.getCurrent();
    }

    /**
     * Get all detectors
     * @return {RemoteData<DplDetector[]>} detectors
     */
    get detectors() {
        return this._detectors$.getCurrent();
    }

    /**
     * QC summary getter
     * @return {RemoteData<QcSummary>} qcsummary
     */
    get qcSummary() {
        return this._qcSummary$.getCurrent();
    }
}
