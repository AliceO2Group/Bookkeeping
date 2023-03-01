import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';
import { Observable, RemoteData } from '/js/src/index.js';

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
     * @param {number|null} tagId the id of the tag this model represents
     * @param {string} panelKey the key of the panel to display
     */
    constructor(tagId = null, panelKey) {
        super();

        this._tagDetails = RemoteData.notAsked();
        this._currentPanelData = RemoteData.notAsked();

        this.tagId = tagId;
        this.currentPanelKey = panelKey;

        this._tagChanges = {};
        this._isEditModeEnabled = false;
    }

    /**
     * Returns the remote data representing the currently displayed tag
     * @return {RemoteData} the tag's remote data
     */
    get tagDetails() {
        return this._tagDetails;
    }

    /**
     * Defines the current log by its id
     *
     * @param {number|null} tagId the new log id
     */
    set tagId(tagId) {
        this._tagId = tagId;
        if (tagId === null) {
            this._tagDetails = RemoteData.notAsked();
        } else {
            this._fetchOneTag(tagId);
        }
    }

    /**
     * Returns the current panel key
     *
     * @return {string} the panel key
     */
    get currentPanelKey() {
        return this._currentPanelKey;
    }

    /**
     * Defines the current panel key
     *
     * @param {string} panelKey the new panel key
     */
    set currentPanelKey(panelKey) {
        this._currentPanelKey = this._availablePanelKeys.includes(panelKey) ? panelKey : this._defaultPanelKey;
        this._fetchCurrentPanelData();
    }

    /**
     * Returns the remote data for the current panel
     *
     * @return {RemoteData} the current panel data
     */
    get currentPanelData() {
        return this._currentPanelData;
    }

    /**
     * Reset the model's state to its default
     *
     * @return {void}
     */
    reset() {
        this._tagDetails = RemoteData.notAsked();
        this._currentPanelData = RemoteData.notAsked();

        this.tagId = null;
        this.currentPanelKey = null;

        this.clearTagChanges(false);
    }

    /**
     * States if edit mode is enabled
     */
    get isEditModeEnabled() {
        return this._isEditModeEnabled;
    }

    /**
     * Set the vale of the edit mode of a Run and update the watchers
     * @param {boolean} value paramter to specify if user is in edit mode
     */
    set isEditModeEnabled(value) {
        this._isEditModeEnabled = Boolean(value);
        this.notify();
    }

    /**
     * Getter for run changes
     * @returns {Object} The value of run changes.
     */
    get tagChanges() {
        return this._tagChanges;
    }

    /**
     * Method to update changes made to the tag object
     *
     * @param {string} key the name of the property to update
     * @param {string|number} value the new value of the property
     * @return {void}
     */
    setTagChange(key, value) {
        this._tagChanges[key] = value;
        this.notify();
    }

    /**
     * A function can update the mail lists and mattermost channels.
     * @param {Number} id the id of the tag that needs to be updated.
     * @returns {undefined}
     */
    async updateOneTag(id) {
        this._tagDetails = RemoteData.loading();
        this.notify();

        const options = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.tagChanges),
        };

        try {
            const { data: updatedTag } = await jsonFetch(`/api/tags/${id}`, options);
            this._tagDetails = RemoteData.success(updatedTag);
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
     * @param {number} tagId Id of the tag to fetch
     * @returns {void}
     * @private
     */
    async _fetchOneTag(tagId) {
        this._tagDetails = RemoteData.loading();
        this.notify();

        try {
            const { data: tagDetails } = await getRemoteData(`/api/tags/${tagId}`);
            this._tagDetails = RemoteData.success(tagDetails);
        } catch (error) {
            this._tagDetails = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Fetch the data for the current panel
     *
     * @return {Promise<void>} resolves once the data is retrieved
     * @private
     */
    async _fetchCurrentPanelData() {
        switch (this._currentPanelKey) {
            case TAG_DETAILS_PANELS_KEYS.LOGS:
                return this._fetchRelatedLogs();
        }
    }

    /**
     * Fetches the logs related to the current tag
     *
     * @returns {Promise<void>} resolves once the data has been retrieved
     * @private
     */
    async _fetchRelatedLogs() {
        if (this._tagId === null) {
            this._currentPanelData = RemoteData.notAsked();
            this.notify();
            return;
        }

        this._currentPanelData = RemoteData.loading();
        this.notify();

        try {
            const { data: relatedLogs } = await getRemoteData(`/api/tags/${this._tagId}/logs`);
            this._currentPanelData = RemoteData.success(relatedLogs);
        } catch (error) {
            this._currentPanelData = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Returns the list of available panel keys
     *
     * @return {string[]} the available panel keys
     */
    get _availablePanelKeys() {
        return [TAG_DETAILS_PANELS_KEYS.LOGS];
    }

    /**
     * Returns the default (and fallback) panel key
     *
     * @return {string} the panel key
     */
    get _defaultPanelKey() {
        return TAG_DETAILS_PANELS_KEYS.LOGS;
    }
}
