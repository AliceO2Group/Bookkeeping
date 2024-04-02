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

import { Observable } from '/js/src/index.js';
import { DataPassesPerLhcPeriodOverviewModel } from './PerLhcPeriodOverview/DataPassesPerLhcPeriodOverviewModel.js';
import { DataPassesPerSimulationPassOverviewModel } from './PerSimulationPassOverview/DataPassesPerSimulationPassOverviewModel.js';

/**
 * Data Passes model
 */
export class DataPassesModel extends Observable {
    /**
     * The constructor of the model
     */
    constructor() {
        super();

        this._perLhcPeriodOverviewModel = new DataPassesPerLhcPeriodOverviewModel();
        this._perLhcPeriodOverviewModel.bubbleTo(this);

        this._perSimulationPassOverviewModel = new DataPassesPerSimulationPassOverviewModel();
        this._perSimulationPassOverviewModel.bubbleTo(this);
    }

    /**
     * Load the overview page model
     * @param {string} [params.lhcPeriodId] lhc period id which data passes should be fetched
     * @returns {void}
     */
    loadPerLhcPeriodOverview({ lhcPeriodId }) {
        this._perLhcPeriodOverviewModel.load({ lhcPeriodId });
    }

    /**
     * Reset the overview page model to its default state
     * @returns {void}
     */
    clearPerLhcPeriodOverview() {
        this._perLhcPeriodOverviewModel.reset();
    }

    /**
     * Returns the model for the overview page
     *
     * @return {DataPassesPerLhcPeriodOverviewModel} the overview model
     */
    get perLhcPeriodOverviewModel() {
        return this._perLhcPeriodOverviewModel;
    }

    /**
     * Load the overview page model
     * @param {string} [params.simulationPassId] simulation pass id which data passes should be fetched
     * @returns {void}
     */
    loadPerSimulationPassOverview({ simulationPassId }) {
        this._perSimulationPassOverviewModel.simulationPassId = Number(simulationPassId);
        this._perSimulationPassOverviewModel.load();
    }

    /**
     * Reset the overview page model to its default state
     * @returns {void}
     */
    clearPerSimulationPassOverview() {
        this._perSimulationPassOverviewModel.reset();
    }

    /**
     * Returns the model for the overview page
     *
     * @return {DataPassesPerLhcPeriodOverviewModel} the overview model
     */
    get perSimulationPassOverviewModel() {
        return this._perSimulationPassOverviewModel;
    }
}
