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

        // Overview
        this.clearTags();

        // Detail
        this.clearTag();

        // Create
        this.clearEditor();
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
    getText() {
        return this.text;
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
     * Fetches all Tags.
     *
     * @returns {undefined}
     */
    async fetchAllTags() {
        this.tags = RemoteData.loading();
        this.notify();

        const response = await fetchClient('/api/tags');
        const result = await response.json();

        if (result.data) {
            this.tags = RemoteData.success(result.data);
        } else {
            this.tags = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
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
        if (this.getTag().isSuccess()) {
            // We already have this panel
            return;
        }

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
        if (this.getLogsOfTag().isSuccess()) {
            // We already have this panel
            return;
        }

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
                text: this.getText(),
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
    setText(text) {
        this.text = text;
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
     * Sets all data related to the Tags to `NotAsked`.
     *
     * @returns {undefined}
     */
    clearTags() {
        this.tags = RemoteData.NotAsked();
    }

    /**
     * Sets all data related to the Tag creation screen to a default value.
     *
     * @returns {undefined}
     */
    clearEditor() {
        this.text = '';
        this.createdTag = RemoteData.NotAsked();
    }
}

export default TagModel;
