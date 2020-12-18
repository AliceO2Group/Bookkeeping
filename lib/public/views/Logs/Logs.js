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

import { fetchClient, Observable, RemoteData } from '/js/src/index.js';
import { setMarkDownBox } from '../../components/common/markdown.js';
import { removeElement } from '../../utilities/removeElement.js';

/**
 * Model representing handlers for log entries page
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
        this.resetLogsParams(false);

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

        if (!this.model.runs.getRuns().isSuccess()) {
            this.logs = RemoteData.loading();
            this.notify();
        }

        const params = {
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
            ...this.runFilterValues.length > 0 && {
                'filter[run][values]': this.runFilterValues.join(),
                'filter[run][operation]': this.runFilterOperation.toLowerCase(),
            },
            ...this.sortingColumn && this.sortingOperation && {
                [`sort[${this.sortingColumn}]`]: this.sortingOperation,
            },
            'page[offset]': (this.selectedPage - 1) * (this.logsPerPage === Infinity ?
                this.model.INFINITE_SCROLL_CHUNK_SIZE : this.logsPerPage),
            'page[limit]': this.logsPerPage === Infinity ? this.model.INFINITE_SCROLL_CHUNK_SIZE : this.logsPerPage,
        };

        const endpoint = `/api/logs?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            if (this.isInfiniteScrollEnabled()) {
                const payload = this.logs && this.logs.payload ? [...this.logs.payload, ...result.data] : result.data;
                this.logs = RemoteData.success(payload);
            } else {
                this.logs = RemoteData.success(result.data);
            }

            this.totalPages = result.meta.page.pageCount;
        } else {
            this.logs = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
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

        const title = this.getTitle();
        const text = this.getText();
        const tags = this.getSelectedTags();
        const runs = this.getSelectedRuns();
        const parentLogId = this.getParentLogId();
        const runNumbers = this.getRunNumbers();

        const body = {
            title,
            text,
            ...tags.length > 0 && { tags },
            ...runs.length > 0 && { runs },
            ...parentLogId > 0 && { parentLogId },
            ...runNumbers && { runNumbers },
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
            this.runNumbers = null;

            await this.model.router.go(`/?page=log-detail&id=${this.createdLog.payload.id}`);
        } else {
            this.createdLog = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
            this.notify();
        }
    }

    /**
     * Set the parent log id parameter of the current reply log being created
     * @param {Number} id Received string from the view
     * @returns {undefined}
     */
    setParentLogId(id) {
        this.parentLogId = id;
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
     * Updates the selected tag ID array according to the HTML attributes of the options
     * @param {HTMLCollection} selectedOptions The currently selected tags by the user, according to HTML specification
     * @returns {undefined}
     */
    setSelectedTags(selectedOptions) {
        this.tags = [...selectedOptions].map(({ value }) => parseInt(value, 10));
        this.notify();
    }

    /**
     * Updates the selected run ID array according to the HTML attributes of the options
     * @param {HTMLCollection} selectedOptions The currently selected runs by the user, according to HTML specification
     * @returns {undefined}
     */
    setSelectedRuns(selectedOptions) {
        this.runs = [...selectedOptions].map(({ value }) => parseInt(value, 10));
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
     * Set the runNumbers parameter of the current log being created
     * @param {string} runNumbers Received string from the view
     * @returns {undefined}
     */
    setRunNumbers(runNumbers) {
        this.runNumbers = runNumbers;
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
     * Get the parent log id of the current reply log being created, if any
     * @returns {Number} parent log id of the current reply log
     */
    getParentLogId() {
        return this.parentLogId;
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
     * Get the tag values of the current log being created
     * @returns {Array} the tag objects of the current log being created
     */
    getSelectedTags() {
        return this.tags;
    }

    /**
     * Get the run values of the current log being created
     * @returns {Array} the run objects of the current log being created
     */
    getSelectedRuns() {
        return this.runs;
    }

    /**
     * Get the attachment values of the current log being created
     * @returns {Array} the attachments of the current log being created
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
     * Getter for the filter operation of runs
     * @returns {String} The filter operation to be performed on the runs (AND, OR)
     */
    getRunFilterOperation() {
        return this.runFilterOperation;
    }

    /**
     * Getter for show more tags criteria
     * @returns {Boolean} Returns if more tags should be shown above the predefined limit
     */
    shouldShowMoreTags() {
        return this.moreTags;
    }

    /**
     * Getter for show more runs criteria
     * @returns {Boolean} Returns if more runs should be shown above the predefined limit
     */
    shouldShowMoreRuns() {
        return this.moreRuns;
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
     * @returns {RemoteData} the log created by the Create Log screen
     */
    getCreatedLog() {
        return this.createdLog;
    }

    /**
     * Getter for log numbers
     * @returns {string} The run numbers
     */
    getRunNumbers() {
        return this.runNumbers;
    }

    /**
     * Returns all filtering, sorting and pagination settings to their default values
     * @param {Boolean} fetch Whether to refetch all logs after filters have been reset
     * @return {undefined}
     */
    resetLogsParams(fetch = true) {
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

        this.runFilterOperation = 'AND';
        this.runFilterValues = [];
        this.moreRuns = false;

        this.sortingColumn = '';
        this.sortingOperation = '';
        this.sortingPreviewColumn = '';
        this.sortingPreviewOperation = '';

        this.amountDropdownVisible = false;
        this.logsPerPage = 10;
        this.selectedPage = 1;
        this.totalPages = 1;

        /**
         * Value saved from perPageAmountInputComponent
         * @see perPageAmountInputComponent
         * @type {number}
         */
        this.customPerPage = 10;

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
            || this.runFilterValues.length !== 0
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
     * Add a run to the filter
     * @param {string} run The run to be added to the filter criteria
     * @returns {undefined}
     */
    addRunToFilter(run) {
        this.runFilterValues = [...this.runFilterValues, run];
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
     * Remove a run from the filter
     * @param {string} targetRun The run that should be removed
     * @returns {undefined}
     */
    removeRunFromFilter(targetRun) {
        this.runFilterValues = this.runFilterValues.filter((run) => run !== targetRun);
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
     * Checks if a run is already defined within the user's filter criteria
     * @param {String} run The run to check on
     * @return {Boolean} Whether the run is in the user's filter criteria
     */
    isRunInFilter(run) {
        return this.runFilterValues.includes(run);
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
     * Sets the filter operation according to the user input
     * @param {String} operation The filter operation to be performed (AND, OR)
     * @returns {undefined}
     */
    setRunFilterOperation(operation) {
        this.runFilterOperation = operation;
        if (this.runFilterValues.length > 0) {
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
     * Toggles the visibility of run filters above the predefined limit
     * @return {undefined}
     */
    toggleMoreRuns() {
        this.moreRuns = !this.moreRuns;
        this.notify();
    }

    /**
     * Returns the currently set sorting operation for the given column
     * @param {String} key The column key to check on
     * @return {String} The sorting operation for the given column, null if this column is not selected
     */
    getSortingOperation(key) {
        return key === this.sortingColumn ? this.sortingOperation : null;
    }

    /**
     * Returns the currently set sorting preview operation for the given column
     * @param {String} key The column key to check on
     * @return {String} The sorting preview operation for the given column, null if this column is not hovered over
     */
    getSortingPreviewOperation(key) {
        return key === this.sortingPreviewColumn ? this.sortingPreviewOperation : null;
    }

    /**
     * Sets the sorting column and operation based on the existing values for these variables
     * @param {String} key The column key to apply an operation to
     * @return {undefined}
     */
    setSortingValues(key) {
        if (this.sortingColumn !== key) {
            this.sortingColumn = key;
            this.sortingOperation = 'asc';
        } else {
            switch (this.sortingOperation) {
                case '':
                    this.sortingOperation = 'asc';
                    break;
                case 'asc':
                    this.sortingOperation = 'desc';
                    break;
                case 'desc':
                    this.sortingColumn = '';
                    this.sortingOperation = '';
                    break;
            }
        }

        this.sortingPreviewOperation = '';
        this.notify();
        this.fetchAllLogs();
    }

    /**
     * Sets the sorting preview column and operation based on the existing values for these variables
     * @param {String} key The column key to apply an operation preview to
     * @return {undefined}
     */
    setSortingPreviewValues(key) {
        if (this.sortingPreviewColumn !== key) {
            this.sortingPreviewColumn = key;
            this.sortingPreviewOperation = 'asc';
        } else {
            switch (this.sortingOperation) {
                case '':
                    this.sortingPreviewOperation = 'asc';
                    break;
                case 'asc':
                    this.sortingPreviewOperation = 'desc';
                    break;
                case 'desc':
                    this.sortingPreviewOperation = 'none';
                    break;
            }
        }

        this.notify();
    }

    /**
     * Empties the sorting preview
     * @return {undefined}
     */
    clearSortingPreviewValues() {
        this.sortingPreviewOperation = '';
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
            this.infiniteScrollEnabled = amount === Infinity;
            this.logsPerPage = amount;
            this.selectedPage = 1;
            this.fetchAllLogs();
        }

        this.amountDropdownVisible = false;
    }

    /**
     * Saves custom per page value
     * @param {Number} amount The amount of logs that should be shown per page
     * @see perPageAmountInputComponent
     * @return {void}
     */
    setCustomPerPage(amount) {
        this.customPerPage = amount;
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
        this.infiniteScrollEnabled = false;
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
        this.tags = [];
        this.runs = [];
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

    /**
     * Returns whether the filter should be shown or not
     * @returns {Boolean} returns whether the filter should be shown
     */
    getShowFilters() {
        return this.showFilters || false;
    }

    /**
     * Sets whether the filters are shown or not
     * @param {Boolean} showFilters Whether the filter should be shown
     * @returns {Boolean} returns boolean
     */
    setShowFilters(showFilters) {
        this.showFilters = showFilters;
        this.notify();
    }

    /**
     * Toggles whether the filters are shown
     * @returns {Boolean} returns boolean
     */
    toggleShowFilters() {
        this.setShowFilters(!this.getShowFilters());
        this.notify();
    }

    /**
     * Returns the state of table infinite scroll mode
     * @return {boolean} The state of table infinite scroll mode
     */
    isInfiniteScrollEnabled() {
        return this.infiniteScrollEnabled;
    }
}
