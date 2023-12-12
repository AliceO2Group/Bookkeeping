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
import { RunsOverviewModel } from '../../Runs/Overview/RunsOverviewModel.js';
import { LogsOverviewModel } from '../../Logs/Overview/LogsOverviewModel.js';

/**
 * Model representing handlers for runs page
 *
 */
export class HomeModel extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Model} model Pass the model to access the defined functions
     * @return {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this._runsOverviewModel = new RunsOverviewModel(model);
        this._runsOverviewModel.bubbleTo(this);

        this._logsOverviewModel = new LogsOverviewModel(model);
        this._logsOverviewModel.bubbleTo(this);
    }

    /**
     * Load runs and logs overview data
     * @return {void}
     */
    loadOverview() {
        this._runsOverviewModel.fetchRuns();
        this._logsOverviewModel.fetchLogs();
    }

    /**
     * Returns the model for the runs overview
     * @return {RunsOverviewModel} the overview model
     */
    get runsOverviewModel() {
        return this._runsOverviewModel;
    }

    /**
     * Returns the model for the logs overview
     * @return {LogsOverviewModel} the overview model
     */
    get logsOverviewModel() {
        return this._logsOverviewModel;
    }
}
