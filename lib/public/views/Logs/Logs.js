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
import { setMarkDownBox } from '../../components/common/markdown.js';

/**
 * Model representing handlers for homePage.js
 */
export default class Overview extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Object} model Pass the model to access the defined functions
     * @returns {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this.model = model;

        this.clearLogs();

        this.createdLog = RemoteData.NotAsked();
        this.title = '';
        this.text = '';

        this.isPreviewActive = false;
        this.editors = [];
    }

    /**
     * Retrieve every relevant log from the API
     * @param {Number} offset Pagination offset to include when making the API call
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchAllLogs(offset = 0) {
        this.logs = RemoteData.loading();
        this.notify();

        const endpoint = `/api/logs?page[offset]=${offset}&page[limit]=${this.logsPerPage}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.logs = RemoteData.success(result.data);
            this.filteredLogs = RemoteData.success(result.data);
            this.totalPages = result.meta.page.pageCount;
        } else {
            this.logs = RemoteData.failure(result.errors);
            this.filteredLogs = RemoteData.failure(result.errors);
        }

        this.notify();
    }

    /**
     * Retrieve a specified log from the API
     * @param {Number} id The ID of the log to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchOneLog(id) {
        this.logs = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/logs/${id}/tree`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.logs = RemoteData.success([result.data]);
            this.filteredLogs = RemoteData.success([result.data]);
        } else {
            this.logs = RemoteData.failure(result.errors);
            this.filteredLogs = RemoteData.failure(result.errors);
        }
        this.notify();
    }

    /**
     * Create the log with the variables set in the model, handle errors appriopately
     * @returns {undefined}
     */
    async createLog() {
        this.createdLog = RemoteData.loading();
        this.notify();

        const body = {
            title: this.getTitle(),
            text: this.getText(),
        };

        if (this.parentLogId > 0) {
            body.parentLogId = this.parentLogId;
        }

        const response = await fetchClient('/api/logs', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        if (result.data) {
            this.createdLog = RemoteData.success(result.data);
            this.title = '';
            this.text = '';

            await this.model.router.go(`/?page=entry&id=${this.createdLog.payload.id}`);
        } else {
            this.createdLog = RemoteData.failure(result.errors);
            this.notify();
        }
    }

    /**
     * Set the title paramter in the model
     * @param {String} title Received string from the view
     * @returns {undefined}
     */
    setTitle(title) {
        this.title = title;
        this.notify();
    }

    /**
     * Set the text paramter in the model
     * @param {String} text Received string from the view
     * @returns {undefined}
     */
    setText(text) {
        this.text = text;
        this.notify();
    }

    /**
     * Get the title value
     * @returns {String} the title in the model
     */
    getTitle() {
        return this.title;
    }

    /**
     * Get the text value
     * @returns {String} the text in the model
     */
    getText() {
        return this.text;
    }

    /**
     * Getter for all the data
     * @returns {RemoteData} Returns all of the filtered logs
     */
    getLogs() {
        return this.filteredLogs;
    }

    /**
     * Getter for filter criteria
     * @returns {Boolean} Returns if more filters should be shown above the predefined limit
     */
    shouldShowMoreFilters() {
        return this.moreFilters;
    }

    /**
     * Getter for visible log dropdown
     * @returns {Number} Returns if the dropdown for choosing an amount of logs should be visible
     */
    isAmountDropdownVisible() {
        return this.amountDropdownVisible;
    }

    /**
     * Getter for logs per page
     * @returns {Number} Returns the number of logs to show on a single page
     */
    getLogsPerPage() {
        return this.logsPerPage;
    }

    /**
     * Getter for the currently selected page
     * @returns {Number} The currently selected page
     */
    getSelectedPage() {
        return this.selectedPage;
    }

    /**
     * Getter for total pages
     * @returns {Number} Returns the total amount of pages available for the page selector
     */
    getTotalPages() {
        return this.totalPages;
    }

    /**
     * Getter for the created log
     * @returns {RemoteData} the log created by the Add Entry screen
     */
    getCreatedLog() {
        return this.createdLog;
    }

    /**
     * Add filter to the selection
     * @param {string} tag The tag to be added to the filter criteria
     * @returns {Array} Sets the data according to the filters applied
     */
    addFilter(tag) {
        this.filterCriteria = [...this.filterCriteria, tag];
        this.setFilteredData();
    }

    /**
     * Remove filter from the selection
     * @param {string} condition The condition to filter the array on
     * @returns {Array} Sets the array with the new filter criteria
     */
    removeFilter(condition) {
        this.filterCriteria = this.filterCriteria.filter((tag) => tag !== condition);
        this.setFilteredData();
    }

    /**
     * Filter the data
     * @returns {Array} Sets the data according to the amount of applied filters
     */
    setFilteredData() {
        this.filterCriteria.length !== 0
            ? this.filterByTags()
            : this.filteredLogs = RemoteData.success(this.logs.payload);

        this.notify();
    }

    /**
     * Filter data by tags if applicable
     * @returns {Array} Sets the filtered data on the criteria applied by the user
     */
    filterByTags() {
        this.filteredLogs = RemoteData.success(this.logs.payload.filter((entry) => this.hasExistingTag(entry)));
    }

    /**
     * Check for an existing tag
     * @param {Object} entry The entry in the total array of the data
     * @return {Boolean} Returns the status of the existence of a tag in the data entry
     */
    hasExistingTag(entry) {
        return this.filterCriteria.filter((tag) => entry.tags.filter(({ text }) => tag === text).length > 0).length > 0;
    }

    /**
     * Counts the tags with their total appearances
     * @return {Object} Returns the count of each tag
     */
    getTagCounts() {
        if (this.logs.isSuccess()) {
            return this.logs.payload.reduce((accumulator, currentValue) => {
                currentValue.tags.forEach(({ text: tag }) => {
                    accumulator[tag] = (accumulator[tag] || 0) + 1;
                });
                return accumulator;
            }, {});
        } else {
            return {};
        }
    }

    /**
     * Checks if a tag is already defined within the user's filter criteria
     * @param {String} tag The tag to check on
     * @return {Boolean} Whether the tag is in the user's filter criteria
     */
    isTagInFilterCriteria(tag) {
        return this.filterCriteria.includes(tag);
    }

    /**
     * Toggles the visibility of tag filters above the predefined limit
     * @return {Boolean} Whether the extra filters should be shown
     */
    toggleMoreFilters() {
        this.moreFilters = !this.moreFilters;
        this.notify();
    }

    /**
     * Toggles the visibility of the menu within the log amounts dropdown
     * @return {Boolean} The new state of the amounts dropdown
     */
    toggleLogsDropdownVisible() {
        this.amountDropdownVisible = !this.amountDropdownVisible;
        this.notify();
    }

    /**
     * Sets how many logs are visible per a page, in accordance with the page selector
     * @param {Number} amount The amount of logs that should be shown per page
     * @return {Number} The first page of the new logs, totalling the amount set by the user
     */
    setLogsPerPage(amount) {
        if (this.logsPerPage !== amount) {
            this.logsPerPage = amount;
            this.selectedPage = 1;
            this.fetchAllLogs((this.selectedPage - 1) * amount);
        }

        this.amountDropdownVisible = false;
        this.notify();
    }

    /**
     * Sets the page chosen through the page selector for usage in pagination, and re-fetches data based on this
     * @param {Number} page The chosen page number
     * @return {Number} The chosen page number
     */
    setSelectedPage(page) {
        if (this.selectedPage !== page) {
            this.selectedPage = page;
            this.fetchAllLogs((this.selectedPage - 1) * this.logsPerPage);
            this.notify();
        }
    }

    /**
     * Sets all data related to the Logs to `NotAsked`.
     * @returns {undefined}
     */
    clearLogs() {
        this.logs = RemoteData.NotAsked();
        this.filteredLogs = RemoteData.NotAsked();
        this.filterCriteria = [];
        this.moreFilters = false;

        this.amountDropdownVisible = false;
        this.logsPerPage = 10;
        this.selectedPage = 1;
        this.totalPages = 1;
    }

    /**
     * Clear the single editor in the model
     * @returns {undefined}
     */
    clearSingleEditor() {
        this.editor = null;
        this.isPreviewActive = false;
    }

    /**
     * Clear the model variables to prevent memory leaks
     * @returns {undefined}
     */
    flushModel() {
        this.rootLogId = -1;
        this.parentLogId = -1;
        this.isPreviewActive = false;
        this.text = '';
        this.title = '';
        this.editor = null;
        this.editors = [];
    }

    /**
     * Convert the textarea of the preview to a Markdown box
     * @param {String} textAreaId The id of the preview box
     * @param {Object} changeHandler The optional changehandler with 2 keys: locaiton and name to get the setter method
     * @param {Object} readOnlyProperties Properties of the readOnlyBox
     * @returns {undefined}
     */
    setMarkdownBox(textAreaId, changeHandler = { location: '', name: '' },
        readOnlyProperties = { isReadOnly: false, textValue: '' }) {
        const { isReadOnly, textValue } = readOnlyProperties;
        const shouldRenderReadOnly = textValue && isReadOnly;
        const mdBoxStyling = shouldRenderReadOnly ?
            { width: 'auto', height: 'auto' } : { width: '80rem', height: '40rem' };

        !this.isPreviewActive && setTimeout(() => {
            this.editor = setMarkDownBox(textAreaId, this.model, changeHandler, isReadOnly, mdBoxStyling);
        }, 40);

        !this.editor && setTimeout(() => {
            this.editor !== undefined && this.editors.push(this.editor);
        }, 50);

        this.isPreviewActive = !this.isPreviewActive;
        this.notify();
    }
}
