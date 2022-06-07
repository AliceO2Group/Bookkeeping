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
        const endpoint = '/api/tags';
        this.tags = RemoteData.loading();
        const response = await fetchClient(endpoint, { method: 'GET' });
        let result = {};

        if (response.ok) {
            // 204 means no tags but the response do not have a body
            if (response.status === 204) {
                result = { data: [] };
            } else {
                result = await response.json();
            }
        }

        if (Array.isArray(result.data)) {
            this.tags = RemoteData.success(result.data);
        } else {
            this.tags = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }
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
     * Fetches all Tags.
     *
     * @returns {undefined}
     */
    async fetchPageTags() {
        const params = {
            'page[offset]': this.tags.payload && this.tagsPerPage === Infinity ?
                this.tags.payload.length : (this.selectedPage - 1) * this.tagsPerPage,
            'page[limit]': this.tagsPerPage === Infinity ? this.model.INFINITE_SCROLL_CHUNK_SIZE : this.tagsPerPage,
        };

        const endpoint = `/api/tags?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            if (this.isInfiniteScrollEnabled()) {
                const payload = this.tags && this.tags.payload ? [...this.tags.payload, ...result.data] : result.data;
                this.tags = RemoteData.success(payload);
            } else {
                this.tags = RemoteData.success(result.data);
            }

            this.totalPages = result.meta.page.pageCount;
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
     * Sets all data related to the Tags to `NotAsked`.
     *
     * @returns {undefined}
     */
    clearTags() {
        this.tags = RemoteData.NotAsked();
        this.collapsedColumns = [];
        this.collapsableColumns = [];

        this.expandedFilters = [];

        this.amountDropdownVisible = false;
        this.tagsPerPage = 10;
        this.selectedPage = 1;
        this.totalPages = 1;
        this.infiniteScrollEnabled = false;

        /**
         * Value saved from perPageAmountInputComponent
         * @see perPageAmountInputComponent
         * @type {number}
         */
        this.customPerPage = 10;
    }

    /**
     * Sets all data related to the Tag creation screen to a default value.
     *
     * @returns {undefined}
     */
    clearEditor() {
        this._text = '';
        this._mattermost = '',
        this._email = '',
        this.createdTag = RemoteData.NotAsked();
        this.notify();
    }

    /**
     * Getter for visible tag dropdown
     * @returns {Number} Returns if the dropdown for choosing an amount of tags should be visible
     */
    isAmountDropdownVisible() {
        return this.amountDropdownVisible;
    }

    /**
     * Getter for tags per page
     * @returns {Number} Returns the number of tags to show on a single page
     */
    getTagsPerPage() {
        return this.tagsPerPage;
    }

    /**
     * Getter for total pages
     * @returns {Number} Returns the total amount of pages available for the page selector
     */
    getTotalPages() {
        return this.totalPages;
    }

    /**
     * Getter for the currently selected page
     * @returns {Number} The currently selected page
     */
    getSelectedPage() {
        return this.selectedPage;
    }

    /**
     * Returns the state of table infinite scroll mode
     * @return {boolean} The state of table infinite scroll mode
     */
    isInfiniteScrollEnabled() {
        return this.infiniteScrollEnabled;
    }

    /**
     * Toggles the visibility of the menu within the log amounts dropdown
     * @return {Boolean} The new state of the amounts dropdown
     */
    toggleTagsDropdownVisible() {
        this.amountDropdownVisible = !this.amountDropdownVisible;
        this.notify();
    }

    /**
     * Sets how many tags are visible per a page, in accordance with the page selector
     * @param {Number} amount The amount of tags that should be shown per page
     * @return {Number} The first page of the new tags, totalling the amount set by the user
     */
    setTagsPerPage(amount) {
        if (this.tagsPerPage !== amount) {
            this.infiniteScrollEnabled = amount === Infinity;
            this.tagsPerPage = amount;
            this.selectedPage = 1;
            this.fetchPageTags();
        }

        this.amountDropdownVisible = false;
    }

    /**
     * Sets the page chosen through the page selector for usage in pagination, and re-fetches data based on this
     * @param {Number} page The chosen page number
     * @return {Number} The chosen page number
     */
    setSelectedPage(page) {
        if (this.selectedPage !== page) {
            this.selectedPage = page;
            this.fetchPageTags();
        }
    }

    /**
     * Returns whether the number of rows is fixed
     * @returns {Boolean} whether the number of visible rows is fixed
     */
    getRowCountIsFixed() {
        return this.rowCountFixed | false;
    }

    /**
     * Sets if the rowCount should be fixed or not
     * @param {Boolean} fixed whether the number of visible rows should be fixed or not
     * @returns {Boolean} return boolean
     */
    setRowCountFixed(fixed) {
        this.rowCountFixed = fixed;
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
        this._isEditModeEnabled = value ? true : false;
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
