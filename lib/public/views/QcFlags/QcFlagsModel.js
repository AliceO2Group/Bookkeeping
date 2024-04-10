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
     * @return {QcFlagsForDataPassOverviewModel} the overview model
     */
    get forDataPassOverviewModel() {
        return this._forDataPassOverviewModel;
    }

    /**
     * Returns the model for the overview page
     *
     * @return {QcFlagsForSimulationPassOverviewModel} the overview model
     */
    get forSimulationPassOverviewModel() {
        return this._forSimulationPassOverviewModel;
    }
}
