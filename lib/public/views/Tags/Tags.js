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
import { TagDetailsModel } from './Details/TagDetailsModel.js';
import { tagsProvider } from '../../services/tag/tagsProvider.js';

/**
 * Tag model
 */
class TagModel extends Observable {
    /**
     * Creates a new `Tag Model` instance.
     *
     * @param {Model} model Pass the model to access the defined functions.
     * @returns {undefined}
     */
    constructor(model) {
        super();
        this.model = model;

        // Global tags list
        this.tags = RemoteData.notAsked();

        // Overview
        this._overviewModel = new TagsOverviewModel();
        this._overviewModel.bubbleTo(this);

        // Detail
        this._detailsModel = new TagDetailsModel();
        this._detailsModel.bubbleTo(this);

        // Create
        this.clearEditor();
    }

    /**
     * Load the details page for the given tag
     *
     * @param {number} tagId  the id of the tag to display
     * @param {string} panelKey the key of the panel to display
     * @return {void}
     */
    loadDetails(tagId, panelKey) {
        this._detailsModel.tagId = tagId;
        this._detailsModel.currentPanelKey = panelKey;
    }

    /**
     * Clear the tag details page state
     *
     * @return {void}
     */
    clearDetails() {
        this._detailsModel.reset();
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
     * Sets the text for the tag creation screen to a newly provided text.
     *
     * @param {String} text The newly inserted text.
     * @returns {void}
     */
    set text(text) {
        this._text = text;
        this.notify();
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
     * Setter for email
     *
     * @param {String} email The newly inserted email.
     * @returns {void}
     */
    set email(email) {
        this._email = email;
        this.notify();
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
     * Setter for mattermost.
     *
     * @param {String} mattermost The newly inserted mattermost groups.
     * @returns {void}
     */
    set mattermost(mattermost) {
        this._mattermost = mattermost;
        this.notify();
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
     * Create the log with the variables set in the model, handling errors appropriately
     * @returns {void}
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
            tagsProvider.maskAsStale();
            await this.model.router.go(`/?page=tag-detail&id=${result.data.id}`);
        } else {
            this.createdTag = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
            this.notify();
        }
    }

    /**
     * Sets all data related to the Tag creation screen to a default value.
     *
     * @returns {void}
     */
    clearEditor() {
        this._text = '';
        this._mattermost = '';
        this._email = '';
        this.createdTag = RemoteData.NotAsked();
        this.notify();
    }

    /**
     * Returns the overview sub-model
     *
     * @return {TagsOverviewModel} the overview sub-model
     */
    get overviewModel() {
        return this._overviewModel;
    }

    /**
     * Returns the details sub-model
     *
     * @return {TagDetailsModel} the details sub-model
     */
    get detailsModel() {
        return this._detailsModel;
    }
}

export default TagModel;
