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

import { Observable, RemoteData, fetchClient } from '/js/src/index.js';
import { TagsOverviewModel } from './Overview/TagsOverviewModel.js';
import { parseFetchResponse } from '../../utilities/parseFetchResponse.js';

/**
 * Tag model
 */
class TagModel extends Observable {
    /**
     * Creates a new `Tag Model` instance.
     *
     * @param {*} model Pass the model to access the defined functions.
     * @returns {undefined}
     */
    constructor(model) {
        super();
        this.model = model;

        // Global tags list
        this.tags = RemoteData.notAsked();

        // Overview
        this.overview = new TagsOverviewModel();
        this.overview.bubbleTo(this);

        // Detail
        this.clearTag();

        // Create
        this.clearEditor();
        this._isEditModeEnabled = false;
        this._tagChanges = {};
    }

    /**
     * Returns the Tag data.
     *
     * @returns {RemoteData} The Tag data.
     */
    getTag() {
        return this.tag;
    }

    /**
     * Returns the Logs of a tag.
     *
     * @returns {RemoteData} The Logs of a Tag.
     */
    getLogsOfTag() {
        return this.logsOfTag;
    }

    /**
     * Returns the Tags data.
     *
     * @returns {RemoteData} The Tags data.
     */
    getTags() {
        return this.tags;
    }

    /**
     * Returns the currently inserted text from the tag creation screen.
     *
     * @returns {String} The text currently inserted in the tag creation screen.
     */
    get text() {
        return this._text;
    }

    /**
     * Getter for email
     *
     * @returns {String} The text currently inserted in the tag creation screen.
     */
    get email() {
        return this._email;
    }

    /**
     * Getter for mattermost
     *
     * @returns {String} The text currently inserted in the tag creation screen.
     */
    get mattermost() {
        return this._mattermost;
    }

    /**
     * Returns the recently created tag, if any, from the tag creation screen.
     *
     * @returns {RemoteData} The recently created tag.
     */
    getCreatedTag() {
        return this.createdTag;
    }

    /**
     * Fetches all Tags without page restrictions.
     *
     * @returns {undefined}
     */
    async fetchAllTags() {
        this.tags = RemoteData.loading();

        const endpoint = '/api/tags';
        const response = await fetchClient(endpoint, { method: 'GET' });

        const { remoteData } = await parseFetchResponse(response);
        this.tags = remoteData;
        this.notify();
    }

    /**
     * A function can update the mail lists and mattermost channels.
     * @param {Number} id the id of the tag that needs to be updated.
     * @returns {undefined}
     */
    async updateOneTag(id) {
        this.tag = RemoteData.loading();
        this.notify();

        const options = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.tagChanges),
        };
        const response = await fetchClient(`/api/tags/${id}`, options);
        const result = await response.json();

        if (result.data) {
            this.tag = RemoteData.success(result.data);
        } else {
            this.tag = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }

    /**
     * Fetches the Tag data.
     *
     * @param {*} tagId Id of the tag.
     * @returns {undefined}
     */
    async fetchOneTag(tagId) {
        this.tag = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/tags/${tagId}`);
        const result = await response.json();

        if (result.data) {
            this.tag = RemoteData.success(result.data);
        } else {
            this.tag = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }

        this.notify();
    }

    /**
     * Fetches the logs with provided tag.
     *
     * @param {*} tagId Id of the tag.
     * @returns {undefined}
     */
    async fetchLogsOfTag(tagId) {
        this.logsOfTag = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/tags/${tagId}/logs`);
        const result = await response.json();

        if (result.data) {
            this.logsOfTag = RemoteData.success(result.data);
        } else {
            this.logsOfTag = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }

        this.notify();
    }

    /**
     * Create the log with the variables set in the model, handling errors appropriately
     * @returns {undefined}
     */
    async createTag() {
        this.createdTag = RemoteData.loading();
        this.notify();
        const response = await fetchClient('/api/tags', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: this._text,
                mattermost: this.model.isAdmin() && this._mattermost ? this._mattermost : null,
                email: this.model.isAdmin() && this._email ? this._email : null,
            }),
        });
        const result = await response.json();

        if (result.data) {
            this.clearEditor();
            await this.model.router.go(`/?page=tag-detail&id=${result.data.id}`);
        } else {
            this.createdTag = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
            this.notify();
        }
    }

    /**
     * Sets the text for the tag creation screen to a newly provided text.
     *
     * @param {String} text The newly inserted text.
     * @returns {undefined}
     */
    set text(text) {
        this._text = text;
        this.notify();
    }

    /**
     * Setter for email
     *
     * @param {String} email The newly inserted email.
     * @returns {undefined}
     */
    set email(email) {
        this._email = email;
        this.notify();
    }

    /**
     * Setter for mattermost.
     *
     * @param {String} mattermost The newly inserted mattermost groups.
     * @returns {undefined}
     */
    set mattermost(mattermost) {
        this._mattermost = mattermost;
        this.notify();
    }

    /**
     * Sets all data related to the Tag to `NotAsked`.
     *
     * @returns {undefined}
     */
    clearTag() {
        this.tag = RemoteData.NotAsked();
        this.logsOfTag = RemoteData.NotAsked();
    }

    /**
     * Sets all data related to the Tag creation screen to a default value.
     *
     * @returns {undefined}
     */
    clearEditor() {
        this._text = '';
        this._mattermost = '';
        this._email = '';
        this.createdTag = RemoteData.NotAsked();
        this.notify();
    }

    /**
     * Return if edit mode is enabled
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
     * If the key and value is empty the object clears itself.
     * @param {Object} object key and a value for adding object values
     */
    set tagChanges({ key, value }) {
        if (!key && !value) {
            this._tagChanges = {};
        } else {
            this._tagChanges[key] = value;
        }
        this.notify();
    }
}

export default TagModel;
