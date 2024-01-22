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
import { LhcFillsOverviewModel } from '../../LhcFills/Overview/LhcFillsOverviewModel.js';

/**
 * Model storing state for the home page
 */
export class HomePageModel extends Observable {
    /**
     * The constructor of the home model object
     * @param {Model} model global model
     */
    constructor(model) {
        super();
        this._runsOverviewModel = new RunsOverviewModel(model);
        this._runsOverviewModel.bubbleTo(this);

        this._logsOverviewModel = new LogsOverviewModel(model, true);
        this._logsOverviewModel.bubbleTo(this);

        this._lhcFillsOverviewModel = new LhcFillsOverviewModel();
        this._lhcFillsOverviewModel.bubbleTo(this);
    }

    /**
     * Load runs and logs overview data
     * @return {void}
     */
    loadOverview() {
        this._runsOverviewModel.fetchRuns();
        this._logsOverviewModel.fetchLogs(true);
        this._lhcFillsOverviewModel.load();
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

    /**
     * Returns the model for the lhcFills overview
     * @return {LhcFillsOverviewModel} the overview model
     */
    get lhcFillsOverviewModel() {
        return this._lhcFillsOverviewModel;
    }
}
