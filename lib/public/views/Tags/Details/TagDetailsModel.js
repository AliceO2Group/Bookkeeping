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

import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';

import { PaginationModel } from '../../../components/Pagination/PaginationModel.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';

import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';
import { Observable, RemoteData } from '/js/src/index.js';
import { tagsProvider } from '../../../services/tag/tagsProvider.js';
import { TabbedPanelModel } from '../../../components/TabbedPanel/TabbedPanelModel.js';

export const TAG_DETAILS_PANELS_KEYS = {
    LOGS: 'logs',
};

/**
 * Model storing a given tag details state
 */
export class TagDetailsModel extends Observable {
    /**
     * Constructor
     *
     * @param {number} tagId the id of the tag this model represents
     * @param {string|null|undefined} [panelKey=null] the key of the panel to display
     */
    constructor(tagId, panelKey = null) {
        super();

        this._tagId = tagId;
        this._tagDetails = RemoteData.notAsked();

        this._fetchOneTag();

        this._tagChanges = {};
        this._isEditModeEnabled = false;

        this._tabbedPanelModel = new TagDetailsTabbedPanelModel(tagId, panelKey);
        this._tabbedPanelModel.bubbleTo(this);
    }

    /**
     * Set the current tagId
     *
     * @param {number} tagId the new tagId
     */
    set tagId(tagId) {
        if (tagId !== this._tagId) {
            this._tagId = tagId;
            this._tabbedPanelModel.tagId = tagId;

            this._fetchOneTag();
            this.clearTagChanges();
        }
    }

    /**
     * Returns the remote data representing the currently displayed tag
     *
     * @return {RemoteData} the tag's remote data
     */
    get tagDetails() {
        return this._tagDetails;
    }

    /**
     * States if edit mode is enabled
     */
    get isEditModeEnabled() {
        return this._isEditModeEnabled;
    }

    /**
     * Defines if edit mode is enabled
     *
     * @param {boolean} value if true, edit mode will be enabled
     */
    set isEditModeEnabled(value) {
        this._isEditModeEnabled = Boolean(value);
        this.notify();
    }

    /**
     * Getter for tag's changes
     *
     * @returns {Object} The value of tag changes.
     */
    get tagChanges() {
        return this._tagChanges;
    }

    /**
     * Method to update changes made to the tag object
     *
     * @param {string} key the name of the property to update
     * @param {string|number|null} value the new value of the property
     * @return {void}
     */
    setTagChange(key, value) {
        this._tagChanges[key] = value;
        this.notify();
    }

    /**
     * Confirm the pending tag changes
     *
     * @returns {undefined}
     */
    async updateOneTag() {
        if (!this.tagDetails.isSuccess()) {
            return;
        }
        const { id } = this._tagDetails.payload;

        this._tagDetails = RemoteData.loading();
        this.notify();

        const options = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this._tagChanges),
        };

        try {
            const { data: updatedTag } = await jsonFetch(`/api/tags/${id}`, options);
            this._tagDetails = RemoteData.success(updatedTag);

            tagsProvider.maskAsStale();
        } catch (error) {
            this._tagDetails = RemoteData.failure(error);
        }

        this.clearTagChanges(false);
        this.notify();
    }

    /**
     * Reset the currently stored tag changes
     *
     * @param {boolean} [notify=true] if true, the model will be notified
     * @return {void}
     */
    clearTagChanges(notify = true) {
        this._tagChanges = {};
        this._isEditModeEnabled = false;
        if (notify) {
            this.notify();
        }
    }

    /**
     * Fetches a tag data
     *
     * @returns {void}
     * @private
     */
    async _fetchOneTag() {
        this._tagDetails = RemoteData.loading();
        this.notify();

        try {
            const { data: tagDetails } = await getRemoteData(`/api/tags/${this._tagId}`);
            this._tagDetails = RemoteData.success(tagDetails);
        } catch (error) {
            this._tagDetails = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Returns the model for bottom-page tabs
     *
     * @return {TabbedPanelModel} the tabs model
     */
    get tabbedPanelModel() {
        return this._tabbedPanelModel;
    }
}

/**
 * Sub-model to store the bottom-page tabs model
 */
class TagDetailsTabbedPanelModel extends TabbedPanelModel {
    /**
     * Constructor
     *
     * @param {number} tagId the id of the current tag
     * @param {string|null|undefined} [panelKey=null] the current panel key (null will use default)
     */
    constructor(tagId, panelKey) {
        super(Object.values(TAG_DETAILS_PANELS_KEYS));

        // Pagination model
        this._pagination = new PaginationModel();
        this._pagination.observe(() => this._fetchCurrentPanelData());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        this._tagId = tagId;
        this.currentPanelKey = panelKey;
    }

    /**
     * Defines the current tag ID and fetch data accordingly
     *
     * @param {number} tagId the tag id
     */
    set tagId(tagId) {
        this._tagId = tagId;
        this._fetchCurrentPanelData();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @override
     */
    _fetchCurrentPanelData() {
        switch (this.currentPanelKey) {
            case TAG_DETAILS_PANELS_KEYS.LOGS:
                this._fetchLogsPanelData();
                break;
        }
    }

    /**
     * Returns the pagination model
     *
     * @return {PaginationModel} the pagination model
     */
    get pagination() {
        return this._pagination;
    }

    /**
     * Fetches the logs related to the current tag
     *
     * @param {boolean} clear if true, any previous data will be discarded, even in infinite mode
     * @returns {Promise<void>} resolves once the data has been retrieved
     * @private
     */
    async _fetchLogsPanelData(clear = false) {
        /**
         * @type {Log[]}
         */
        const concatenateWith = !clear && this._pagination.currentPage !== 1 && this._pagination.isInfiniteScrollEnabled
            ? this._currentPageRuns.payload || []
            : [];

        if (!this._pagination.isInfiniteScrollEnabled) {
            this.currentPanelData = RemoteData.loading();
            this.notify();
        }

        try {
            const params = { // Parameters for pagination
                'page[offset]': this._pagination.firstItemOffset,
                'page[limit]': this._pagination.itemsPerPage,
            };

            // API call to fetch logs for current tags, include the pagination params.
            const { items, totalCount } = await getRemoteDataSlice(`/api/tags/${this._tagId}/logs?${new URLSearchParams(params).toString()}`);

            this._pagination.itemsCount = totalCount; // Set items count

            this.currentPanelData = RemoteData.success([...concatenateWith, ...items]);
        } catch (error) {
            this.currentPanelData = RemoteData.failure(error);
        }

        this.notify();
    }
}
