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
     * @returns {void}
     */
    expandLog(id) {
        this._detailedPostsIds.push(id);
        this.notify();
    }

    /**
     * Show log entry collapsed
     * @param {Integer} id of log to collapsed
     * @returns {void}
     */
    collapseLog(id) {
        const index = this._detailedPostsIds.indexOf(id, 0);
        if (index > -1) {
            this._detailedPostsIds.splice(index, 1);
        }
        this.notify();
    }

    /**
     * Given a log id and a value, sets the showCopyUrlSuccessContent indicator for that log,
     * which determines whether to show feedback to the user that the log url was copied to the clipboard
     * @param {number} id the id of the log to set the indicator for
     * @param {boolean} value the value of the indicator
     * @returns {void}
     */
    setShowCopyUrlSuccessContent(id, value) {
        this._logTreeLeafs.payload.find((leaf) => leaf.log.id === id).showCopyUrlSuccessContent = value;
    }

    /**
     * A callback given to the copy url component so that it can rerender after a timeout
     * @param {number} id the id of the log that this callback was called from
     * @returns {void}
     */
    onCopyUrlSuccess(id) {
        this.setShowCopyUrlSuccessContent(id, true);
        this.notify();
        setTimeout(() => {
            this.setShowCopyUrlSuccessContent(id, false);
            this.notify();
        }, 2000);
    }

    /**
     * Returns the current log tree to display in details view
     *
     * @returns {RemoteData} the log tree
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
     * @returns {number|null} the id
     */
    get selectedLogId() {
        return this._selectedLogId;
    }

    /**
     * Set the current selected log id and update the tree accordingly
     *
     * @param {number|null} selectedLogId the id of the selected log
     * @returns {void}
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
     * @returns {void} Injects the data object with the response data
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
             * @returns {void}
             */
            const parseTreeNode = (node, level) => {
                const { children, /** @type {Log} */ ...log } = node;
                logTreeLeafs.push({ log, level, showCopyUrlSuccessContent: false });
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
