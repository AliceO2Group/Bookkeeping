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
     * Fetches all Tags without page restrictions.
     *
     * @returns {undefined}
     */
    async fetchAllTags() {
        const endpoint = '/api/tags';
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.tags = RemoteData.success(result.data);
        } else {
            this.tags = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
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
        this.text = '';
        this.createdTag = RemoteData.NotAsked();
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
}

export default TagModel;
