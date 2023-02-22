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

import { Observable, RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';

/**
 * Model to store the state of a log tree display page
 */
export class LogTreeViewModel extends Observable {
    /**
     * Constructor
     * @param {number|null} [selectedLogId=null] the log for which tree must be displayed
     */
    constructor(selectedLogId = null) {
        super();

        this._selectedLogId = selectedLogId;
    }

    /**
     * Toggles view mode of all posts in detailed view
     *
     * @returns {void}
     */
    toggleAllPostView() {
        this._showAllPosts = !this._showAllPosts;
        this._detailedPostsIds = this._showAllPosts && this._logTreeLeafs.isSuccess()
            ? this._logTreeLeafs.payload.map(({ log: { id } }) => id)
            : [];
        this.notify();
    }

    /**
     * Getter for show/collapse all button state
     * @returns {boolean} Button state
     */
    isShowAll() {
        return this._showAllPosts;
    }

    /**
     * Show log entry in detailed view
     * @param {Integer} id of log to show detailed
     * @returns {undefined}
     */
    expandLog(id) {
        this._detailedPostsIds.push(id);
        this.notify();
    }

    /**
     * Show log entry collapsed
     * @param {Integer} id of log to collapsed
     * @returns {undefined}
     */
    collapseLog(id) {
        const index = this._detailedPostsIds.indexOf(id, 0);
        if (index > -1) {
            this._detailedPostsIds.splice(index, 1);
        }
        this.notify();
    }

    /**
     * Returns the current log tree to display in details view
     *
     * @return {RemoteData} the log tree
     */
    get logTreeLeafs() {
        return this._logTreeLeafs;
    }

    /**
     * Getter for all the detailed log entry ids
     *
     * @returns {number[]} Returns all of the detailed log ids
     */
    get detailedPostsIds() {
        return this._detailedPostsIds;
    }

    /**
     * Returns the current selected log id
     *
     * @return {number|null} the id
     */
    get selectedLogId() {
        return this._selectedLogId;
    }

    /**
     * Set the current selected log id and update the tree accordingly
     *
     * @param {number|null} selectedLogId the id of the selected log
     * @return {void}
     */
    set selectedLogId(selectedLogId) {
        this._selectedLogId = selectedLogId;
        if (selectedLogId === null) {
            this._logTreeLeafs = RemoteData.NotAsked();
        } else {
            this._fetchLogTree(selectedLogId);
        }
    }

    /**
     * Retrieve the tree of a given log from the API
     *
     * @param {number} selectedLogId The id of the log for which tree must be retrieved
     * @returns {undefined} Injects the data object with the response data
     */
    async _fetchLogTree(selectedLogId) {
        this._logTreeLeafs = RemoteData.loading();
        this.notify();

        try {
            const { data } = await getRemoteData(`/api/logs/${selectedLogId}/tree`);
            const logTreeLeafs = [];

            /**
             * Parse the tree node and update the log tree leafs list
             *
             * @param {{children: array}|Log} node the node to parse
             * @param {number} level the level of the node
             * @return {void}
             */
            const parseTreeNode = (node, level) => {
                const { children, /** @type {Log} */ ...log } = node;
                logTreeLeafs.push({ log, level });
                for (const subNode of children || []) {
                    parseTreeNode(subNode, level + 1);
                }
            };
            parseTreeNode(data, 0);
            this._logTreeLeafs = RemoteData.success(logTreeLeafs);
        } catch (error) {
            this._logTreeLeafs = RemoteData.failure(error);
        }

        // Open the fetched log by default
        this._detailedPostsIds = [selectedLogId];
        this._showAllPosts = false;
        this.notify();
    }
}
