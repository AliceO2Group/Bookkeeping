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
import { LogsOverviewListModel } from './LogsOverviewListModel.js';
import { LogsOverviewTreeModel } from './LogsOverviewTreeModel.js';

/**
 * Model representing handlers for log overview page
 */
export class LogsOverviewModel extends Observable {
    /**
     * The constructor of the Overview model object
     *
     * @param {Model} model Pass the model to access the defined functions
     */
    constructor(model) {
        super();

        this._isOverviewThreaded = false;

        this._overviewListModel = new LogsOverviewListModel(model);
        this._overviewListModel.bubbleTo(this);

        this._overviewTreeModel = new LogsOverviewTreeModel();
        this._overviewTreeModel.bubbleTo(this);
    }

    /**
     * Toggle between list and collapsed logs
     * @returns {Promise<void>} Injects the data object with the response data
     */
    toggleLogsView() {
        this.setIsOverviewThreaded(!this.isOverviewThreaded());
    }

    /**
     * Return the current overview
     * @returns {LogsOverviewTreeModel|LogsOverviewListModel} The model
     */
    get current() {
        return this._isOverviewThreaded ? this._overviewTreeModel : this._overviewListModel;
    }

    /**
     * Load the correct logs based off current model in use
     * @returns {undefined}
     */
    load() {
        if (!this.current.pagination.isInfiniteScrollEnabled) {
            this.current.fetchLogs();
        }
    }

    /**
     * Returns a boolean indicating if we are currently in threaded view
     * @returns {boolean} Boolean indicating if we are currently in threaded view
     */
    isOverviewThreaded() {
        return this._isOverviewThreaded;
    }

    /**
     * Set _isViewThreaded
     * @param {boolean} value New boolean value
     * @returns {undefined}
     */
    setIsOverviewThreaded(value) {
        this._isOverviewThreaded = value;
    }
}
