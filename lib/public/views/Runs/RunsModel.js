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
import { RunDetailsModel } from './Details/RunDetailsModel.js';
import { RunsOverviewModel } from './Overview/RunsOverviewModel.js';
import { RunsPerLhcPeriodOverviewModel } from './RunPerPeriod/RunsPerLhcPeriodOverviewModel.js';
import { RunsPerDataPassOverviewModel } from './RunPerDataPass/RunsPerDataPassOverviewModel.js';
import { RunsPerSimulationPassOverviewModel } from './RunsPerSimulationPass/RunsPerSimulationPassOverviewModel.js';

/**
 * Model representing handlers for runs page
 *
 */
export class RunsModel extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Model} model Pass the model to access the defined functions
     * @return {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this._detailsModel = new RunDetailsModel();
        this._detailsModel.bubbleTo(this);
        this._overviewModel = new RunsOverviewModel(model);
        this._overviewModel.bubbleTo(this);
        this._perLhcPeriodOverviewModel = new RunsPerLhcPeriodOverviewModel(model);
        this._perLhcPeriodOverviewModel.bubbleTo(this);
        this._perDataPassOverviewModel = new RunsPerDataPassOverviewModel(model);
        this._perDataPassOverviewModel.bubbleTo(this);
        this._perSimulationPassOverviewModel = new RunsPerSimulationPassOverviewModel(model);
        this._perSimulationPassOverviewModel.bubbleTo(this);
    }

    /**
     * Load runs overview data
     * @return {void}
     */
    loadOverview() {
        if (! this._overviewModel.pagination.isInfiniteScrollEnabled) {
            this._overviewModel.load();
        }
    }

    /**
     * Returns the model for the overview page
     * @return {RunsOverviewModel} the overview model
     */
    get overviewModel() {
        return this._overviewModel;
    }

    /**
     * Load the details page for the given run
     * @param {string} [params.runNumber = null]  the runNumber of the run to display
     * @param {string} [params.id = null]  Usage of this paramter is deprecated, use runNumber if feasible,
     * @param {string} [params.panel = null] the key of the panel to display
     * @return {void}
     */
    loadDetails({ runNumber = null, id: runId = null, panel: panelKey = null }) {
        runId = runId ? Number(runId) : runId;
        runNumber = runNumber ? Number(runNumber) : runNumber;
        this._detailsModel.clearAndLoad({ runId, runNumber, panelKey });
    }

    /**
     * Returns the run details sub model
     * @return {RunDetailsModel} the sub-model
     */
    get detailsModel() {
        return this._detailsModel;
    }

    /**
     * Load runs overview data
     * @return {void}
     */
    loadPerLhcPeriodOverview({ lhcPeriodName }) {
        if (!this._perLhcPeriodOverviewModel.pagination.isInfiniteScrollEnabled) {
            this._perLhcPeriodOverviewModel.load({ lhcPeriodName });
        }
    }

    /**
     * Returns the model for the overview page
     * @return {RunsPerLhcPeriodOverviewModel} the overview model
     */
    get perLhcPeriodOverviewModel() {
        return this._perLhcPeriodOverviewModel;
    }

    /**
     * Load runs overview data
     * @return {void}
     */
    loadPerDataPassOverview({ dataPassId }) {
        if (!this._perDataPassOverviewModel.pagination.isInfiniteScrollEnabled) {
            this._perDataPassOverviewModel.dataPassId = dataPassId;
            this._perDataPassOverviewModel.load();
        }
    }

    /**
     * Returns the model for the overview page
     * @return {RunsPerDataPassOverviewModel} the overview model
     */
    get perDataPassOverviewModel() {
        return this._perDataPassOverviewModel;
    }

    /**
     * Load runs overview per simulation pass data
     * @return {void}
     */
    loadPerSimulationPassOverview({ simulationPassId }) {
        if (!this._perSimulationPassOverviewModel.pagination.isInfiniteScrollEnabled) {
            this._perSimulationPassOverviewModel.simulationPassId = simulationPassId;
            this._perSimulationPassOverviewModel.load();
        }
    }

    /**
     * Returns the model for the overview per simulation pass page
     * @return {RunsPerDataPassOverviewModel} the overview model
     */
    get perSimulationPassOverviewModel() {
        return this._perSimulationPassOverviewModel;
    }
}
