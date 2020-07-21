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

        this.clearRuns();

        this.createdRun = RemoteData.NotAsked();
        this.title = '';
        this.text = '';

        this.isPreviewActive = false;
        this.editors = [];

        this.collapsableColumns = [];
        this.collapsedColumns = [];
    }

    /**
     * Retrieve every relevant run from the API
     * @param {Number} offset Pagination offset to include when making the API call
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchAllRuns(offset = 0) {
        if (!this.model.tags.getTags().isSuccess()) {
            this.runs = RemoteData.loading();
            this.notify();
        }

        const params = {
            'page[offset]': offset,
            'page[limit]': this.runsPerPage,
            ...this.tagFilterValues.length > 0 && {
                'filter[tag][values]': this.tagFilterValues.join(),
                'filter[tag][operation]': this.tagFilterOperation.toLowerCase(),
            },
        };

        const endpoint = `/api/runs?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.runs = RemoteData.success(result.data);
            this.totalPages = result.meta.page.pageCount;
        } else {
            this.runs = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }

        if (this.model.tags.getTags().isNotAsked()) {
            await this.model.tags.fetchAllTags();
        }

        this.notify();
    }

    /**
     * Retrieve a specified run from the API
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchOneRun(id) {
        this.runs = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/runs/${id}/tree`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.runs = RemoteData.success([result.data]);
        } else {
            this.runs = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }
        this.notify();
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
     * @returns {RemoteData} Returns all of the filtered runs
     */
    getRuns() {
        return this.runs;
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
     * Getter for visible run dropdown
     * @returns {Number} Returns if the dropdown for choosing an amount of runs should be visible
     */
    isAmountDropdownVisible() {
        return this.amountDropdownVisible;
    }

    /**
     * Getter for runs per page
     * @returns {Number} Returns the number of runs to show on a single page
     */
    getRunsPerPage() {
        return this.runsPerPage;
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
     * Getter for the created run
     * @returns {RemoteData} the run created by the Add Entry screen
     */
    getCreatedRun() {
        return this.createdRun;
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
     * Add a tag to the filter
     * @param {string} tag The tag to be added to the filter criteria
     * @returns {undefined}
     */
    addTagToFilter(tag) {
        this.tagFilterValues = [...this.tagFilterValues, tag];
        this.fetchAllRuns();
    }

    /**
     * Remove a tag from the filter
     * @param {string} targetTag The tag that should be removed
     * @returns {undefined}
     */
    removeTagFromFilter(targetTag) {
        this.tagFilterValues = this.tagFilterValues.filter((tag) => tag !== targetTag);
        this.fetchAllRuns();
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
            this.fetchAllRuns();
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
     * Toggles the visibility of the menu within the run amounts dropdown
     * @return {Boolean} The new state of the amounts dropdown
     */
    toggleRunsDropdownVisible() {
        this.amountDropdownVisible = !this.amountDropdownVisible;
        this.notify();
    }

    /**
     * Sets how many runs are visible per a page, in accordance with the page selector
     * @param {Number} amount The amount of runs that should be shown per page
     * @return {Number} The first page of the new runs, totalling the amount set by the user
     */
    setRunsPerPage(amount) {
        if (this.runsPerPage !== amount) {
            this.runsPerPage = amount;
            this.selectedPage = 1;
            this.fetchAllRuns((this.selectedPage - 1) * amount);
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
            this.fetchAllRuns((this.selectedPage - 1) * this.runsPerPage);
            this.notify();
        }
    }

    /**
     * Sets all data related to the Runs to `NotAsked`.
     * @returns {undefined}
     */
    clearRuns() {
        this.runs = RemoteData.NotAsked();
        this.collapsedColumns = [];

        this.expandedFilters = [];
        this.tagFilterValues = [];
        this.tagFilterOperation = 'AND';
        this.moreTags = false;

        this.amountDropdownVisible = false;
        this.runsPerPage = 10;
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
        this.rootRunId = -1;
        this.parentRunId = -1;
        this.isPreviewActive = false;
        this.text = '';
        this.title = '';
        this.editor = null;
        this.editors = [];
        this.collapsedColumns = [];
        this.isCollapsed = false;

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
            { width: 'auto', height: 'auto' } : { width: 'auto', height: '40rem' };

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
