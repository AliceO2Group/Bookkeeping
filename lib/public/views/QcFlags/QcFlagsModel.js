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

import { QcFlagsForDataPassOverviewModel } from './ForDataPass/QcFlagsForDataPassOverviewModel.js';
import { QcFlagsForSimulationPassOverviewModel } from './ForSimulationPass/QcFlagsForSimulationPassOverviewModel.js';
import { Observable } from '/js/src/index.js';

/**
 * Quality Control Flags model
 */
export class QcFlagsModel extends Observable {
    /**
     * The constructor of the model
     */
    constructor() {
        super();

        this._overviewForDataPassModel = new QcFlagsForDataPassOverviewModel();
        this._overviewForDataPassModel.bubbleTo(this);

        this._overviewForSimulationPassModel = new QcFlagsForSimulationPassOverviewModel();
        this._overviewForSimulationPassModel.bubbleTo(this);
    }

    /**
     * Load the overview page model
     *
     * @returns {void}
     */
    loadForDataPassOverview({ dataPassId, runNumber, dplDetectorId }) {
        this._overviewForDataPassModel.runNumber = parseInt(runNumber, 10);
        this._overviewForDataPassModel.dataProductionId = parseInt(dataPassId, 10);
        this._overviewForDataPassModel.dplDetectorId = parseInt(dplDetectorId, 10);
        this._overviewForDataPassModel.load();
    }

    /**
     * Load the overview page model
     *
     * @returns {void}
     */
    loadForSimulationPassOverview({ simulationPassId, runNumber, dplDetectorId }) {
        this._overviewForSimulationPassModel.runNumber = parseInt(runNumber, 10);
        this._overviewForSimulationPassModel.dataProductionId = parseInt(simulationPassId, 10);
        this._overviewForSimulationPassModel.dplDetectorId = parseInt(dplDetectorId, 10);
        this._overviewForSimulationPassModel.load();
    }

    /**
     * Returns the model for the overview page
     *
     * @return {QcFlagsForDataPassOverviewModel} the overview model
     */
    get overviewForDataPassModel() {
        return this._overviewForDataPassModel;
    }

    /**
     * Returns the model for the overview page
     *
     * @return {QcFlagsForSimulationPassOverviewModel} the overview model
     */
    get overviewForSimulationPassModel() {
        return this._overviewForSimulationPassModel;
    }
}
