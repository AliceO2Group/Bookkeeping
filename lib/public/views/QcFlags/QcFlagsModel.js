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

import { buildUrl } from '../../utilities/fetch/buildUrl.js';
import { QcFlagCreationForDataPassModel } from './Create/forDataPass/QcFlagCreationForDataPassModel.js';
import { QcFlagsForDataPassOverviewModel } from './ForDataPass/QcFlagsForDataPassOverviewModel.js';
import { QcFlagsForSimulationPassOverviewModel } from './ForSimulationPass/QcFlagsForSimulationPassOverviewModel.js';
import { QcFlagDetailsForDataPassModel } from './details/forDataPass/QcFlagDetailsForDataPassModel.js';
import { Observable } from '/js/src/index.js';
import { QcFlagCreationForSimulationPassModel } from './Create/forSimulationPass/QcFlagCreationForSimulationPassModel.js';
import { QcFlagDetailsForSimulationPassModel } from './details/forSimulationPass/QcFlagDetailsForSimulationPassModel.js';

/**
 * Quality Control Flags model
 */
export class QcFlagsModel extends Observable {
    /**
     * The constructor of the model
     * @param {Model} model the global model
     */
    constructor(model) {
        super();
        this.model = model;

        this._forDataPassOverviewModel = new QcFlagsForDataPassOverviewModel();
        this._forDataPassOverviewModel.bubbleTo(this);

        this._forSimulationPassOverviewModel = new QcFlagsForSimulationPassOverviewModel();
        this._forSimulationPassOverviewModel.bubbleTo(this);
    }

    /**
     * Load the overview page model
     *
     * @returns {void}
     */
    loadForDataPassOverview({ dataPassId, runNumber, detectorId }) {
        this._forDataPassOverviewModel.runNumber = parseInt(runNumber, 10);
        this._forDataPassOverviewModel.dataPassId = parseInt(dataPassId, 10);
        this._forDataPassOverviewModel.detectorId = parseInt(detectorId, 10);
        this._forDataPassOverviewModel.load();
    }

    /**
     * Returns the model for the overview page
     *
     * @return {QcFlagsForDataPassOverviewModel} the overview model
     */
    get forDataPassOverviewModel() {
        return this._forDataPassOverviewModel;
    }

    /**
     * Load the creation for data pass page model
     *
     * @returns {void}
     */
    loadCreationForDataPass({ dataPassId, runNumber, detectorId }) {
        this._creationForDataPassModel = new QcFlagCreationForDataPassModel(
            {
                dataPassId: parseInt(dataPassId, 10),
                runNumber: parseInt(runNumber, 10),
                detectorId: parseInt(detectorId, 10),
            },
            () => this.model.router.go(buildUrl(
                '/',
                { page: 'qc-flags-for-data-pass', dataPassId, runNumber, detectorId },
            )),
        );
        this._creationForDataPassModel.bubbleTo(this);
    }

    /**
     * Return the creation for data pass page model
     *
     * @return {QcFlagCreationForDataPassModel} the creation model
     */
    get creationForDataPassModel() {
        return this._creationForDataPassModel;
    }

    /**
     * Load the QC flag details model
     *
     * @returns {void}
     */
    loadDetailsForDataPass({ id, dataPassId, runNumber, detectorId }) {
        this._detailsForDataPassModel = new QcFlagDetailsForDataPassModel(
            { id: parseInt(id, 10), dataPassId: parseInt(dataPassId, 10) },
            () => this.model.router.go(
                buildUrl(
                    '/',
                    {
                        page: 'qc-flags-for-data-pass',
                        runNumber,
                        dataPassId,
                        detectorId,
                    },
                ),
                true,
            ),
        );
        this._detailsForDataPassModel.bubbleTo(this);
    }

    /**
     * Return the model for QC flag details for data pass page
     *
     * @return {QcFlagDetailsForDataPassModel} the creation model
     */
    get detailsForDataPassModel() {
        return this._detailsForDataPassModel;
    }

    /**
     * Load the overview page model
     *
     * @returns {void}
     */
    loadForSimulationPassOverview({ simulationPassId, runNumber, detectorId }) {
        this._forSimulationPassOverviewModel.runNumber = parseInt(runNumber, 10);
        this._forSimulationPassOverviewModel.simulationPassId = parseInt(simulationPassId, 10);
        this._forSimulationPassOverviewModel.detectorId = parseInt(detectorId, 10);
        this._forSimulationPassOverviewModel.load();
    }

    /**
     * Returns the model for the overview page
     *
     * @return {QcFlagsForSimulationPassOverviewModel} the overview model
     */
    get forSimulationPassOverviewModel() {
        return this._forSimulationPassOverviewModel;
    }

    /**
     * Load the creation for simulation pass page model
     *
     * @returns {void}
     */
    loadCreationForSimulationPass({ simulationPassId, runNumber, detectorId }) {
        this._creationForSimulationPassModel = new QcFlagCreationForSimulationPassModel(
            {
                simulationPassId: parseInt(simulationPassId, 10),
                runNumber: parseInt(runNumber, 10),
                detectorId: parseInt(detectorId, 10),
            },
            () => this.model.router.go(buildUrl(
                '/',
                { page: 'qc-flags-for-simulation-pass', simulationPassId, runNumber, detectorId },
            )),
        );
        this._creationForSimulationPassModel.bubbleTo(this);
    }

    /**
     * Return the creation for simulation pass page model
     *
     * @return {QcFlagCreationForSimulationPassModel} the creation model
     */
    get creationForSimulationPassModel() {
        return this._creationForSimulationPassModel;
    }

    /**
     * Load the QC flag details model
     *
     * @returns {void}
     */
    loadDetailsForSimulationPass({ id, simulationPassId, runNumber, detectorId }) {
        this._detailsForSimulationPassModel = new QcFlagDetailsForSimulationPassModel(
            { id: parseInt(id, 10), simulationPassId: parseInt(simulationPassId, 10) },
            () => this.model.router.go(buildUrl(
                '/',
                {
                    page: 'qc-flags-for-simulation-pass',
                    runNumber,
                    simulationPassId,
                    detectorId,
                },
            ), true),
        );
        this._detailsForSimulationPassModel.bubbleTo(this);
    }

    /**
     * Return the model for QC flag details for simulation pass page
     *
     * @return {QcFlagDetailsForSimulationPassModel} the creation model
     */
    get detailsForSimulationPassModel() {
        return this._detailsForSimulationPassModel;
    }
}
