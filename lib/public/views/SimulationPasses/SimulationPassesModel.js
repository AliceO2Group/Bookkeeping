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
import { SimulationPassesPerLhcPeriodOverviewModel } from './PerLhcPeriodOverview/SimulationPassesPerLhcPeriodOverviewModel.js';

/**
 * Simulation Passes model
 */
export class SimulationPassesModel extends Observable {
    /**
     * The constructor of the model
     */
    constructor() {
        super();

        this._perLhcPeriodOverviewModel = new SimulationPassesPerLhcPeriodOverviewModel();
        this._perLhcPeriodOverviewModel.bubbleTo(this);
    }

    /**
     * Load the overview page model
     * @param {string} [params.lhcPeriodId] lhc period id which Simulation Passes should be fetched
     * @returns {void}
     */
    loadPerLhcPeriodOverview({ lhcPeriodId }) {
        if (!this._perLhcPeriodOverviewModel.pagination.isInfiniteScrollEnabled) {
            this._perLhcPeriodOverviewModel.lhcPeriodId = lhcPeriodId;
            this._perLhcPeriodOverviewModel.load();
        }
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
     * @return {SimulationPassesPerLhcPeriodOverviewModel} the overview model
     */
    get perLhcPeriodOverviewModel() {
        return this._perLhcPeriodOverviewModel;
    }
}
