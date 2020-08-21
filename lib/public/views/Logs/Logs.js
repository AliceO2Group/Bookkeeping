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
import { removeElement } from '../../utilities/removeElement.js';

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
        this.resetFilters(false);

        this.createdLog = RemoteData.NotAsked();
        this.clearAllEditors();
    }

    /**
     * Retrieve every relevant log from the API
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchAllLogs() {
        if (!this.model.tags.getTags().isSuccess()) {
            this.logs = RemoteData.loading();
            this.notify();
        }

        const params = {
            'page[offset]': (this.selectedPage - 1) * this.logsPerPage,
            'page[limit]': this.logsPerPage,
            ...this.titleFilterText && {
                'filter[title]': this.titleFilterText,
            },
            ...this.authorFilterText && {
                'filter[author]': this.authorFilterText,
            },
            ...this.createdFilterFrom && {
                'filter[created][from]':
                    new Date(`${this.createdFilterFrom.replace(/\//g, '-')}T00:00:00.000`).getTime(),
            },
            ...this.createdFilterTo && {
                'filter[created][to]':
                    new Date(`${this.createdFilterTo.replace(/\//g, '-')}T23:59:59.999`).getTime(),
            },
            ...this.tagFilterValues.length > 0 && {
                'filter[tag][values]': this.tagFilterValues.join(),
                'filter[tag][operation]': this.tagFilterOperation.toLowerCase(),
            },
        };

        const endpoint = `/api/logs?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.logs = RemoteData.success(result.data);
            this.totalPages = result.meta.page.pageCount;
        } else {
            this.logs = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }

        if (this.model.tags.getTags().isNotAsked()) {
            await this.model.tags.fetchAllTags();
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
        } else {
            this.logs = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }
        this.notify();
    }

    /**
     * Create the log with the variables set in the model, handling errors appropriately
     * @returns {undefined}
     */
    async createLog() {
        this.createdLog = RemoteData.loading();
        this.notify();

        const body = {
            title: this.getTitle(),
            text: this.getText(),
            ...this.parentLogId > 0 && { parentLogId: this.parentLogId },
        };

        const options = {
            method: 'POST',
            headers: { Accept: 'application/json' },
        };
        const attachments = this.getAttachments();

        if (attachments.length > 0) {
            // eslint-disable-next-line no-undef
            const formData = new FormData();
            Object.entries(body).forEach(([key, value]) => formData.append(key, value));
            [...attachments].forEach((attachment, index) => formData.append(`attachments.${index}`, attachment));

            options.body = formData;
        } else {
            options.body = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
        }

        const response = await fetchClient('/api/logs', options);
        const result = await response.json();

        if (result.data) {
            this.createdLog = RemoteData.success(result.data);
            this.title = '';
            this.text = '';

            await this.model.router.go(`/?page=entry&id=${this.createdLog.payload.id}`);
        } else {
            this.createdLog = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
            this.notify();
        }
    }

    /**
     * Set the title parameter of the current log being created
     * @param {String} title Received string from the view
     * @returns {undefined}
     */
    setTitle(title) {
        this.title = title;
        this.notify();
    }

    /**
     * Set the text parameter of the current log being created
     * @param {String} text Received string from the view
     * @returns {undefined}
     */
    setText(text) {
        this.text = text;
        this.notify();
    }

    /**
     * Adds one or more attachments to the current log being created
     * @param {FileList} files Received file objects from the view
     * @returns {undefined}
     */
    setAttachments(files) {
        this.attachments = files;
        this.notify();
    }

    /**
     * Flushes all attachments of the current log being created
     * @returns {undefined}
     */
    clearAttachments() {
        this.model.document.getElementById('attachments').value = '';
        this.attachments = [];
        this.notify();
    }

    /**
     * Get the title value of the current log being created
     * @returns {String} the title of the current log being created
     */
    getTitle() {
        return this.title;
    }

    /**
     * Get the text value of the current log being created
     * @returns {String} the text of the current log being created
     */
    getText() {
        return this.text;
    }

    /**
     * Get the attachment values of the current log being created
     * @returns {String} the attachments of the current log being created
     */
    getAttachments() {
        return this.attachments;
    }

    /**
     * Getter for all the data
     * @returns {RemoteData} Returns all of the filtered logs
     */
    getLogs() {
        return this.logs;
    }

    /**
     * Getter for the filter operation of tags
     * @returns {String} The filter operation to be performed on the tags (AND, OR)
     */
    getTagFilterOperation() {
        return this.tagFilterOperation;
    }

    /**
     * Getter for show more tags criteria
     * @returns {Boolean} Returns if more tags should be shown above the predefined limit
     */
    shouldShowMoreTags() {
        return this.moreTags;
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
     * Returns all filters and pagination settings to their default values
     * @param {Boolean} fetch Whether to refetch all logs after filters have been reset
     * @return {undefined}
     */
    resetFilters(fetch = true) {
        this.expandedFilters = [];

        this.titleFilterText = '';
        this.titleFilterDebounce = null;

        this.authorFilterText = '';
        this.authorFilterDebounce = null;

        this.createdFilterFrom = '';
        this.createdFilterTo = '';
        this.createdFilterDebounce = null;

        this.tagFilterOperation = 'AND';
        this.tagFilterValues = [];
        this.moreTags = false;

        this.amountDropdownVisible = false;
        this.logsPerPage = 10;
        this.selectedPage = 1;
        this.totalPages = 1;

        if (fetch) {
            this.fetchAllLogs();
        }
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @returns {Boolean} If any filter is active
     */
    isAnyFilterActive() {
        return (
            this.titleFilterText !== ''
            || this.authorFilterText !== ''
            || this.createdFilterFrom !== ''
            || this.createdFilterTo !== ''
            || this.tagFilterValues.length !== 0
        );
    }

    /**
     * Toggle the expansion state (visibility) of a filter menu
     * @param {String} targetKey The key of the filter whose visibility should be toggled
     * @returns {undefined}
     */
    toggleFilterExpanded(targetKey) {
        if (this.isFilterExpanded(targetKey)) {
            this.expandedFilters = this.expandedFilters.filter((key) => key !== targetKey);
        } else {
            this.expandedFilters.push(targetKey);
        }
        this.notify();
    }

    /**
     * Check if a certain filter should be expanded (visible)
     * @param {String} targetKey The key of the filter whose visibility should be checked
     * @returns {Boolean} Whether the provided filter is expanded or not
     */
    isFilterExpanded(targetKey) {
        return this.expandedFilters.includes(targetKey);
    }

    /**
     * Returns the current title substring filter
     * @returns {String} The current title substring filter
     */
    getTitleFilter() {
        return this.titleFilterText;
    }

    /**
     * Sets the title substring filter if no new inputs were detected for 200 milliseconds
     * @param {String} newTitle The title substring to apply to the filter
     * @returns {undefined}
     */
    setTitleFilter(newTitle) {
        clearTimeout(this.titleFilterDebounce);
        this.titleFilterDebounce = setTimeout(() => {
            this.titleFilterText = newTitle.trim();
            this.fetchAllLogs();
        }, 200);
    }

    /**
     * Returns the current author substring filter
     * @returns {String} The current author substring filter
     */
    getAuthorFilter() {
        return this.authorFilterText;
    }

    /**
     * Sets the author substring filter if no new inputs were detected for 200 milliseconds
     * @param {String} newAuthor The author substring to apply to the filter
     * @returns {undefined}
     */
    setAuthorFilter(newAuthor) {
        clearTimeout(this.authorFilterDebounce);
        this.authorFilterDebounce = setTimeout(() => {
            this.authorFilterText = newAuthor.trim();
            this.fetchAllLogs();
        }, 200);
    }

    /**
     * Returns the current minimum creation datetime
     * @returns {Integer} The current minimum creation datetime
     */
    getCreatedFilterFrom() {
        return this.createdFilterFrom;
    }

    /**
     * Returns the current maximum creation datetime
     * @returns {Integer} The current maximum creation datetime
     */
    getCreatedFilterTo() {
        return this.createdFilterTo;
    }

    /**
     * Set a datetime for the creation datetime filter
     * @param {String} key The filter value to apply the datetime to
     * @param {Object} date The datetime to be applied to the creation datetime filter
     * @param {Boolean} valid Whether the inserted date passes validity check
     * @returns {undefined}
     */
    setCreatedFilter(key, date, valid) {
        if (valid) {
            this[`createdFilter${key}`] = date;
            this.fetchAllLogs();
        }
    }

    /**
     * Set a datetime for the creation datetime filter, with a debounce delay
     * @param {String} key The filter value to apply the datetime to
     * @param {Object} date The datetime to be applied to the creation datetime filter
     * @param {Boolean} valid Whether the inserted date passes validity check
     * @returns {undefined}
     */
    setCreatedFilterWithDebounce(key, date, valid) {
        clearTimeout(this.createdFilterDebounce);
        this.createdFilterDebounce = setTimeout(() => this.setCreatedFilter(key, date, valid), 200);
    }

    /**
     * Add a tag to the filter
     * @param {string} tag The tag to be added to the filter criteria
     * @returns {undefined}
     */
    addTagToFilter(tag) {
        this.tagFilterValues = [...this.tagFilterValues, tag];
        this.fetchAllLogs();
    }

    /**
     * Remove a tag from the filter
     * @param {string} targetTag The tag that should be removed
     * @returns {undefined}
     */
    removeTagFromFilter(targetTag) {
        this.tagFilterValues = this.tagFilterValues.filter((tag) => tag !== targetTag);
        this.fetchAllLogs();
    }

    /**
     * Checks if a tag is already defined within the user's filter criteria
     * @param {String} tag The tag to check on
     * @return {Boolean} Whether the tag is in the user's filter criteria
     */
    isTagInFilter(tag) {
        return this.tagFilterValues.includes(tag);
    }

    /**
     * Sets the filter operation according to the user input
     * @param {String} operation The filter operation to be performed (AND, OR)
     * @returns {undefined}
     */
    setTagFilterOperation(operation) {
        this.tagFilterOperation = operation;
        if (this.tagFilterValues.length > 0) {
            this.fetchAllLogs();
        }
    }

    /**
     * Toggles the visibility of tag filters above the predefined limit
     * @return {undefined}
     */
    toggleMoreTags() {
        this.moreTags = !this.moreTags;
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
            this.fetchAllLogs();
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
            this.fetchAllLogs();
        }
    }

    /**
     * Sets all data related to the Logs to `NotAsked` and clears pagination settings.
     * @returns {undefined}
     */
    clearLogs() {
        this.logs = RemoteData.NotAsked();
        this.collapsableColumns = [];
        this.collapsedColumns = [];
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
     * Clear all editors in the model
     * @returns {undefined}
     */
    clearAllEditors() {
        this.isPreviewActive = false;
        this.parentLogId = -1;

        this.editor = null;
        this.editors = [];

        this.text = '';
        this.title = '';
        this.attachments = [];

        // Remove trailing CodeMirror div(s)
        removeElement('.CodeMirror');
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
            { width: 'auto', height: 'auto' } : { width: 'auto', height: '16rem' };

        !this.isPreviewActive && setTimeout(() => {
            this.editor = setMarkDownBox(textAreaId, this.model, changeHandler, isReadOnly, mdBoxStyling);
        }, 40);

        !this.editor && setTimeout(() => {
            this.editor !== undefined && this.editors.push(this.editor);
        }, 50);

        this.isPreviewActive = !this.isPreviewActive;
        this.notify();
    }

    /**
     * Add eligble columns for collapse to the array in the model
     * @param {String} rowId The rowId being collapsed
     * @param {String} name The name of the column to be collapsed
     * @param {Integer} height Minimal height of the column
     * @returns {undefined}
     */
    addCollapsableColumn(rowId, name, height) {
        const existingColumn = this.collapsableColumns
            .find((element) => element.rowId === rowId && element.name === name);
        if (existingColumn) {
            existingColumn.disabled = false;
        } else {
            this.collapsableColumns.push({ rowId, name, height, disabled: false });
        }
        this.notify();
    }

    /**
     * Remove eligble columns from the collapse array
     * @param {String} rowId The rowId being collapsed
     * @param {String} name The name of the column to be collapsed
     * @returns {undefined}
     */
    disableCollapsableColumn(rowId, name) {
        this.collapsableColumns
            .find((element) => element.rowId === rowId && element.name === name).disabled = true;
        this.notify();
    }

    /**
     * Toggle the collapse of a column
     * @param {String} rowId The rowId being collapsed
     * @param {String} name The name of the column to be collapsed
     * @returns {undefined}
     */
    toggleColumnCollapse(rowId, name) {
        if (this.isColumnExpanded(rowId, name)) {
            this.collapsedColumns = this.collapsedColumns
                .filter((element) => !(element.rowId === rowId && element.name === name));
        } else {
            this.collapsedColumns.push({ rowId, name });
        }

        this.notify();
    }

    /**
     * Returns wether the column should collapse or not
     * @param {String} rowId The rowId to be checked
     * @param {String} name The name of the column to be collapsed
     * @returns {Boolean} Returns wether the column in the row should collapse
     */
    isColumnExpanded(rowId, name) {
        return this.collapsedColumns.some((entry) => entry.rowId === rowId && entry.name === name);
    }

    /**
     * Returns wether the column should collapse or not
     * @param {String} rowId The rowId to be checked
     * @param {String} name The name of the column to be collapsed
     * @returns {Boolean} Returns wether the column in the row should collapse
     */
    canColumnExpand(rowId, name) {
        return this.collapsableColumns.some((entry) => entry.rowId === rowId && entry.name === name && !entry.disabled);
    }

    /**
     * Returns the minimal height of a column
     * @param {String} rowId The rowId to be checked
     * @param {String} name The name of the column
     * @returns {Integer} The smallest known height of the specified column
     */
    getMinimalColumnHeight(rowId, name) {
        const targetColumn = this.collapsableColumns.find((entry) => entry.rowId === rowId && entry.name === name);
        return targetColumn && targetColumn.height;
    }
}
