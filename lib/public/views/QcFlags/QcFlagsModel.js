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

import { QcFlagForDataPassCreationModel } from './Create/ForDataPass/QcFlagForDataPassCreationModel.js';
import { QcFlagsForDataPassOverviewModel } from './ForDataPass/QcFlagsForDataPassOverviewModel.js';
import { QcFlagsForSimulationPassOverviewModel } from './ForSimulationPass/QcFlagsForSimulationPassOverviewModel.js';
import { QcFlagDetailsModel } from './details/QcFlagDetailsModel.js';
import { Observable } from '/js/src/index.js';

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
    loadForDataPassOverview({ dataPassId, runNumber, dplDetectorId }) {
        this._forDataPassOverviewModel.runNumber = parseInt(runNumber, 10);
        this._forDataPassOverviewModel.dataPassId = parseInt(dataPassId, 10);
        this._forDataPassOverviewModel.dplDetectorId = parseInt(dplDetectorId, 10);
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
    loadForDataPassCreation({ dataPassId, runNumber, dplDetectorId }) {
        this._forDataPassCreationModel = new QcFlagForDataPassCreationModel(
            {
                dataPassId: parseInt(dataPassId, 10),
                runNumber: parseInt(runNumber, 10),
                dplDetectorId: parseInt(dplDetectorId, 10),
            },
            // eslint-disable-next-line max-len
            () => this.model.router.go(`/?page=qc-flags-for-data-pass&dataPassId=${dataPassId}&runNumber=${runNumber}&dplDetectorId=${dplDetectorId}`),
        );
        this._forDataPassCreationModel.bubbleTo(this);
    }

    /**
     * Return the creation for data pass page model
     *
     * @return {QcFlagForDataPassCreationModel} the creation model
     */
    get forDataPassCreationModel() {
        return this._forDataPassCreationModel;
    }

    /**
     * Load the overview page model
     *
     * @returns {void}
     */
    loadForSimulationPassOverview({ simulationPassId, runNumber, dplDetectorId }) {
        this._forSimulationPassOverviewModel.runNumber = parseInt(runNumber, 10);
        this._forSimulationPassOverviewModel.simulationPassId = parseInt(simulationPassId, 10);
        this._forSimulationPassOverviewModel.dplDetectorId = parseInt(dplDetectorId, 10);
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
     * Load the QC flag details model
     *
     * @returns {void}
     */
    loadDetails({ id }) {
        this._detailsModel = new QcFlagDetailsModel(
            { id: parseInt(id, 10) },
            () => history.back(),
        );
        this._detailsModel.bubbleTo(this);
    }

    /**
     * Returns the model for the details page
     *
     * @return {QcFlagDetailsModel} the details model
     */
    get detailsModel() {
        return this._detailsModel;
    }
}
