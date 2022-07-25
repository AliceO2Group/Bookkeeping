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
import { TagPickerModel } from '../../components/pickers/tag/TagPickerModel.js';
import { TagFilterModel } from '../../components/Filters/common/TagFilterModel.js';
import { SortModel } from '../../components/Table/SortModel.js';
import { debounce, INPUT_DEBOUNCE_TIME } from '../../utilities/debounce.js';

/**
 * Model representing handlers for log entries page
 */
export default class LogModel extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Object} model Pass the model to access the defined functions
     * @returns {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this.model = model;

        // Sub-models
        this._listingTagsFilterModel = new TagFilterModel();
        this._listingTagsFilterModel.observe(() => this._applyFilters());
        this._creationTagsPickerModel = new TagPickerModel();
        this._overviewSortModel = new SortModel();
        this._overviewSortModel.observe(() => this._applyFilters(true));

        this.clearLogs();
        this.resetLogsParams(false);

        this.createdLog = RemoteData.NotAsked();
        this.clearAllEditors();

        this._debouncedFetchAllLogs = debounce(this.fetchAllLogs.bind(this), INPUT_DEBOUNCE_TIME);
    }

    /**
     * Retrieve every relevant log from the API
     *
     * @param {boolean} clear if true, any previous data will be discarded, even in infinite mode
     *
     * @returns {void} Injects the data object with the response data
     */
    async fetchAllLogs(clear = false) {
        if (!this.model.tags.getTags().isSuccess()) {
            this.logs = RemoteData.loading();
            this.notify();
        }

        const sortOn = this._overviewSortModel.appliedOn;
        const sortDirection = this._overviewSortModel.appliedDirection;

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
            ...!this.listingTagsFilterModel.isEmpty() && {
                'filter[tags][values]': this.listingTagsFilterModel.selected.map((tag) => tag.text).join(),
                'filter[tags][operation]': this.listingTagsFilterModel.combinationOperation.toLowerCase(),
            },
            ...this.runFilterValues.length > 0 && {
                'filter[run][values]': this.runFilterValues.join(),
                'filter[run][operation]': this.runFilterOperation.toLowerCase(),
            },
            ...sortOn && sortDirection && {
                [`sort[${sortOn}]`]: sortDirection,
            },
            'page[offset]': this.logs.payload && this.logsPerPage === Infinity ?
                this.logs.payload.length : (this.selectedPage - 1) * this.logsPerPage,
            'page[limit]': this.logsPerPage === Infinity ? this.model.INFINITE_SCROLL_CHUNK_SIZE : this.logsPerPage,
        };

        const endpoint = `/api/logs?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            if (!clear && this.isInfiniteScrollEnabled()) {
                const payload = this.logs && this.logs.payload ? [...this.logs.payload, ...result.data] : result.data;
                this.logs = RemoteData.success(payload);
            } else {
                this.logs = RemoteData.success(result.data);
            }

            this.totalPages = result.meta.page.pageCount;
        } else {
            this.logs = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
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
            this.logs = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.detailed_post_ids = [];
        this.posts = [];
        this.showAllPosts = true;
        this.notify();
    }

    /**
     * Create the log with the variables set in the model, handling errors appropriately
     * Adds the title of the parent log to a log reply if the title is empty.
     * @returns {undefined}
     */
    async createLog() {
        this.createdLog = RemoteData.loading();
        this.notify();

        const title = this.getTitle();
        const text = this.getText();
        const tags = this.creationTagsPickerModel.selected;
        const parentLogId = this.getParentLogId();
        const runNumbers = this.getRunNumbers();

        const body = {
            title,
            text,
            ...parentLogId > 0 && { parentLogId },
            ...runNumbers && { runNumbers },
        };

        if (title.length === 0 && parentLogId) {
            const response = await fetchClient(`/api/logs/${parentLogId}`, { method: 'GET' });
            const result = await response.json();

            body.title = `Re: ${result.data.title}`;
        }

        const options = {
            method: 'POST',
            headers: { Accept: 'application/json' },
        };
        const attachments = this.getAttachments();

        if (attachments.length > 0 || tags.length > 0) {
            // eslint-disable-next-line no-undef
            const formData = new FormData();
            Object.entries(body).forEach(([key, value]) => formData.append(key, value));
            tags.forEach((tag) => formData.append('tags[]', tag.text));
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
            this.createdLog = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
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
     * Getter for all the detailed log entry ids
     * @returns {array} Returns all of the detailed log ids
     */
    getDetailedPosts() {
        return this.detailed_post_ids;
    }

    /**
     * Toggles view mode of all posts in detailed view
     * @returns {undefined}
     */
    toggleAllPostView() {
        this.detailed_post_ids = this.showAllPosts ? this.posts : [];
        this.showAllPosts = !this.showAllPosts;
        this.notify();
    }

    /**
     * Getter for show/collapse all button state
     * @returns {boolean} Button state
     */
    isShowAll() {
        return this.showAllPosts;
    }

    /**
     * Function for adding post in detailed view posts list
     * @param {Integer} post_id ID of post to add
     * @returns {undefined}
     */
    addPost(post_id) {
        if (!(post_id in this.posts)) {
            this.posts.push(post_id);
        }
    }

    /**
     * Show log entry in detailed view
     * @param {Integer} id of log to show detailed
     * @returns {undefined}
     */
    showPostDetailed(id) {
        this.detailed_post_ids.push(id);
        this.notify();
    }

    /**
     * Show log entry collapsed
     * @param {Integer} id of log to collapsed
     * @returns {undefined}
     */
    collapsePost(id) {
        const index = this.detailed_post_ids.indexOf(id, 0);
        if (index > -1) {
            this.detailed_post_ids.splice(index, 1);
        }
        this.notify();
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
        this.activeFilters = [];

        this.titleFilterText = '';

        this.authorFilterText = '';

        this.createdFilterFrom = '';
        this.createdFilterTo = '';

        this.listingTagsFilterModel.reset();

        this.runFilterOperation = 'AND';
        this.runFilterValues = [];

        this.sortingColumn = '';
        this.sortingOperation = '';
        this.sortingPreviewColumn = '';
        this.sortingPreviewOperation = '';

        this.amountDropdownVisible = false;
        this.rowCountFixed = false;
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
            this._applyFilters(true);
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
            || !this.listingTagsFilterModel.isEmpty()
            || this.runFilterValues.length !== 0
        );
    }

    /**
     * Returns active filters
     * @returns {array} array of active filters
     */
    getActiveFilters() {
        this.activeFilters = [];

        if (this.titleFilterText !== '') {
            this.activeFilters.push('Title');
        }
        if (this.authorFilterText !== '') {
            this.activeFilters.push('Author');
        }
        if (this.createdFilterFrom !== '') {
            this.activeFilters.push('Created from');
        }
        if (this.createdFilterTo !== '') {
            this.activeFilters.push('Created to');
        }
        if (!this.listingTagsFilterModel.isEmpty()) {
            this.activeFilters.push('Tags');
        }
        if (this.runFilterValues.length !== 0) {
            this.activeFilters.push('Runs');
        }

        return this.activeFilters;
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
        this.titleFilterText = newTitle.trim();
        this._applyFilters();
    }

    /**
     * Returns the current title substring filter
     * @returns {String} The current title substring filter
     */
    getRunsFilter() {
        return this.runFilterValues;
    }

    /**
     * Add a run to the filter
     * @param {string} runs The runs to be added to the filter criteria
     * @returns {undefined}
     */
    setRunsFilter(runs) {
        if (!/^[0-9,]*$/.test(runs)) {
            return;
        } else if (!runs.length) {
            this.runFilterValues = [];
        } else {
            this.runFilterValues = runs.match(/\d+/g).map(Number);
        }
        this._applyFilters();
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
        this.authorFilterText = newAuthor.trim();
        this._applyFilters();
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
            this._applyFilters();
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
            this.notify();
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
        this.editors = {};

        this.text = '';
        this.title = '';
        this.creationTagsPickerModel.reset();
        this.runNumbers = null;
        this.attachments = [];

        this.createdLog = RemoteData.NotAsked();

        // Remove trailing CodeMirror div(s)
        removeElement('.CodeMirror');
    }

    /**
     * Convert the textarea of the preview to a Markdown box
     * @param {String} textAreaId The id of the preview box
     * @param {Object} changeHandler The optional change handler with 2 keys: location and name to get the setter method
     * @param {Object} readOnlyProperties Properties of the readOnlyBox
     * @returns {undefined}
     */
    setMarkdownBox(textAreaId, changeHandler = {
        location: '',
        name: '',
    }, readOnlyProperties = {
        isReadOnly: false,
        textValue: '',
    }) {
        const {
            isReadOnly,
            textValue,
        } = readOnlyProperties;
        const shouldRenderReadOnly = textValue && isReadOnly;
        const mdBoxStyling = shouldRenderReadOnly ?
            {
                width: 'auto',
                height: 'auto',
            } : {
                width: 'auto',
                height: '16rem',
            };

        if (textAreaId in this.editors) {
            this.editors[textAreaId].setValue(textValue);
            this.notify();
            return;
        }

        !this.isPreviewActive && setTimeout(() => {
            this.editor = setMarkDownBox(textAreaId, this.model, changeHandler, isReadOnly, mdBoxStyling);
        }, 40);

        !this.editor && setTimeout(() => {
            this.editor !== undefined && (this.editors[textAreaId] = this.editor);
        }, 50);

        this.isPreviewActive = !this.isPreviewActive;
        this.notify();
    }

    /**
     * Removes markdown box
     * @param {String} textAreaId The id of the preview box
     * @returns {undefined}
     */
    removeMarkdownBox(textAreaId) {
        delete this.editors[textAreaId];
        this.notify();
    }

    /**
     * Add eligible columns for collapse to the array in the model
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
            this.collapsableColumns.push({
                rowId,
                name,
                height,
                disabled: false,
            });
        }
        this.notify();
    }

    /**
     * Remove eligible columns from the collapse array
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
            this.collapsedColumns.push({
                rowId,
                name,
            });
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

    /**
     * Returns whether the number of rows is fixed
     * @returns {Boolean} whether the number of visible rows is fixed
     */
    getRowCountIsFixed() {
        return this.rowCountFixed;
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
     * Return the model handling the filtering on tags
     *
     * @return {TagFilterModel} the filtering model
     */
    get listingTagsFilterModel() {
        return this._listingTagsFilterModel;
    }

    /**
     * Return the model handling the tag selection for new log creation
     *
     * @return {TagPickerModel} the picker model
     */
    get creationTagsPickerModel() {
        return this._creationTagsPickerModel;
    }

    /**
     * Returns the model handling the overview page table sort
     *
     * @return {SortModel} the sort model
     */
    get overviewSortModel() {
        return this._overviewSortModel;
    }

    /**
     * Apply the current filtering and update the remote data list
     *
     * @param {boolean} now if true, filtering will be applied now without debouncing
     *
     * @return {void}
     */
    _applyFilters(now = false) {
        this.selectedPage = 1;
        now ? this.fetchAllLogs(true) : this._debouncedFetchAllLogs(true);
    }
}
