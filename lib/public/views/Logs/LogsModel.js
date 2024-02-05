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
import { LogsOverviewModel } from './Overview/LogsOverviewModel.js';
import { LogTreeViewModel } from './Details/LogTreeViewModel.js';
import { LogCreationModel } from './Create/LogCreationModel.js';

/**
 * Model representing handlers for log entries page
 *
 * @implements {OverviewModel}
 */
export class LogsModel extends Observable {
    /**
     * The constructor of the Overview model object
     *
     * @param {Model} model Pass the model to access the defined functions
     */
    constructor(model) {
        super();
        this.model = model;

        this._overviewModel = new LogsOverviewModel(model);
        this._overviewModel.bubbleTo(this);

        this._treeViewModel = new LogTreeViewModel();
        this._treeViewModel.bubbleTo(this);

        /**
         * Redirect user to the created log once it has been successfully created
         *
         * @param {number} logId the id of the created log
         * @return {void}
         */
        const handleLogCreation = (logId) => this.model.router.go(`/?page=log-detail&id=${logId}`);
        this._creationModel = new LogCreationModel(handleLogCreation);
        this._creationModel.bubbleTo(this);
    }

    /**
     * Load logs overview data
     * @return {void}
     */
    loadOverview() {
        if (! this._overviewModel.pagination.isInfiniteScrollEnabled) {
            this._overviewModel.fetchLogs();
        }
    }

    /**
     * Returns the model for the overview page
     * @return {LogsOverviewModel} the overview model
     */
    get overviewModel() {
        return this._overviewModel;
    }

    /**
     * Load the view of the tree of the given log
     *
     * @param {number|string} selectedLogId the id of the log for which tree must be displayed
     * @return {void}
     */
    loadTreeView(selectedLogId) {
        this._treeViewModel.selectedLogId = Number(selectedLogId);
    }

    /**
     * Returns the tree view model
     *
     * @return {LogTreeViewModel} the model
     */
    get treeViewModel() {
        return this._treeViewModel;
    }

    /**
     * Parse the current route parameters to load the log creation model
     *
     * @param {object} queryParams the current query parameters
     * @param {string} [queryParams.parentLogId] the id of log that should be the parent of the log being created
     * @param {string|string[]} [queryParams.runNumbers] the run numbers to link to the log being created
     * @param {string|string[]} [queryParams.lhcFillNumbers] the lhc fill numbers to link to the log being created
     * @param {string|string[]} [queryParams.environmentIds] the environment ids to link to the log being created
     * @return {void}
     */
    loadCreation({ parentLogId, runNumbers, lhcFillNumbers, environmentIds }) {
        if (!Array.isArray(runNumbers)) {
            runNumbers = runNumbers !== undefined ? [runNumbers] : [];
        }

        if (!Array.isArray(lhcFillNumbers)) {
            lhcFillNumbers = lhcFillNumbers !== undefined ? [lhcFillNumbers] : [];
        }

        if (!Array.isArray(environmentIds)) {
            environmentIds = environmentIds !== undefined ? [environmentIds] : [];
        }

        this._creationModel.setLogCreationInitialData({ parentLogId, runNumbers, lhcFillNumbers, environmentIds });
    }

    /**
     * Return the log creation model
     *
     * @return {LogCreationModel} the model
     */
    get creationModel() {
        return this._creationModel;
    }
}
