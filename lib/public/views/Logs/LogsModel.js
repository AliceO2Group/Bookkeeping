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
import { LogReplyModel } from './Create/LogReplyModel.js';
import { TemplatedLogCreationModel } from './Create/TemplatedLogCreationModel.js';

/**
 * Model representing handlers for log entries page
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
         * @type {TemplatedLogCreationModel|null}
         * @private
         */
        this._creationModel = null;

        /**
         * @type {LogReplyModel|null}
         * @private
         */
        this._replyModel = null;
    }

    /**
     * Load logs overview data
     * @return {void}
     */
    loadOverview() {
        if (!this._overviewModel.pagination.isInfiniteScrollEnabled) {
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
     * Handle the log creation
     * @param {number} logId the id of the created log
     * @return {void}
     */
    handleLogCreation(logId) {
        this.model.router.go(`/?page=log-detail&id=${logId}`);
    }

    /**
     * Parse a comma-separated string of numbers to an array of numbers
     * @param {string} commaSeparatedNumbers The comma-separated string of numbers to parse
     * @return {number[]} The parsed numbers
     */
    _parseCommaSeparatedNumbers(commaSeparatedNumbers) {
        return commaSeparatedNumbers.split(',').map((numberString) => parseInt(numberString.trim(), 10));
    }

    /**
     * Parse the current route parameters to load the log creation model
     *
     * @param {object} queryParams the current query parameters
     * @param {string} [queryParams.runNumbers] the run numbers to link to the log being created
     * @param {string} [queryParams.lhcFillNumbers] the lhc fill numbers to link to the log being created
     * @param {string} [queryParams.environmentIds] the environment ids to link to the log being created
     * @return {void}
     */
    loadCreation({ runNumbers, lhcFillNumbers, environmentIds }) {
        const relations = {};

        if (runNumbers) {
            relations.runNumbers = this._parseCommaSeparatedNumbers(runNumbers);
        }
        if (lhcFillNumbers) {
            relations.lhcFillNumbers = this._parseCommaSeparatedNumbers(lhcFillNumbers);
        }
        if (environmentIds) {
            relations.environmentIds = environmentIds.split(',');
        }

        this._creationModel = new TemplatedLogCreationModel(this.handleLogCreation.bind(this), relations);
        this._creationModel.bubbleTo(this);
    }

    /**
     * Return the log creation model
     *
     * @return {TemplatedLogCreationModel|null} the model
     */
    get creationModel() {
        return this._creationModel;
    }

    /**
     * Load the log reply model
     *
     * @param {object} queryParams the current query parameters
     * @param {string} queryParams.parentLogId the id of log that should be the parent of the log being created
     * @return {void}
     */
    loadReply({ parentLogId }) {
        this._replyModel = new LogReplyModel(this.handleLogCreation.bind(this), parseInt(parentLogId, 10));
        this._replyModel.bubbleTo(this);
    }

    /**
     * Retrun the log reply model
     *
     * @return {LogReplyModel|null} the reply model
     */
    get replyModel() {
        return this._replyModel;
    }
}
