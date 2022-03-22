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
import pick from '../../utilities/pick.js';
import { createCSVExport, createJSONExport } from '../../utilities/export.js';

/**
 * Model representing handlers for runs page
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

        this.clearRun();
        this.clearRuns();

        this.clearAllEditors();
        this.resetRunsParams(false);

        this._isEditModeEnabled = false;
        this._runChanges = {};
    }

    /**
     * Retrieve every relevant run from the API
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchAllRuns() {
        if (!this.model.tags.getTags().isSuccess()) {
            this.logs = RemoteData.loading();
            this.notify();
        }

        const params = {
            ...this.runFilterValues && {
                'filter[runNumber]': this.runFilterValues,
            },
            ...this.tagFilterValues.length > 0 && {
                'filter[tag][values]': this.tagFilterValues.join(),
                'filter[tag][operation]': this.tagFilterOperation.toLowerCase(),
            },
            ...this.o2startFilterFrom && {
                'filter[o2start][from]':
                    new Date(`${this.o2startFilterFrom.replace(/\//g, '-')}T00:00:00.000`).getTime(),
            },
            ...this.o2startFilterTo && {
                'filter[o2start][to]':
                    new Date(`${this.o2startFilterTo.replace(/\//g, '-')}T23:59:59.999`).getTime(),
            },
            ...this.o2endFilterFrom && {
                'filter[o2end][from]':
                    new Date(`${this.o2endFilterFrom.replace(/\//g, '-')}T00:00:00.000`).getTime(),
            },
            ...this.o2endFilterTo && {
                'filter[o2end][to]':
                    new Date(`${this.o2endFilterTo.replace(/\//g, '-')}T23:59:59.999`).getTime(),
            },
            ...this.nDetectorsFilterValues && {
                'filter[nDetectors]': this.nDetectorsFilterValues,
            },
            ...this.enviromentIdFilter && {
                'filter[environmentId]': this.enviromentIdFilter,
            },
            ...this.runQualityFilter && {
                'filter[runQuality]': this.runQualityFilter,
            },
            ...this.nFlpsFilterValues && {
                'filter[nFlps]': this.nFlpsFilterValues,
            },
            ...(this.ddflpFilter === true || this.ddflpFilter === false) && {
                'filter[ddflp]': this.ddflpFilter,
            },
            ...(this.dcsFilter === true || this.dcsFilter === false) && {
                'filter[dcs]': this.dcsFilter,
            },
            ...this.epnFilter && {
                'filter[epn]': this.epnFilter,
            },
            ...this.epnTopologyFilter && {
                'filter[epnTopology]': this.epnTopologyFilter,
            },
            ...this.detectorsFilterValues && {
                'filter[detectors]': this.detectorsFilterValues,
            },
            'page[offset]': this.runs.payload && this.isInfiniteScrollEnabled() ?
                this.runs.payload.length : (this.selectedPage - 1) * this.runsPerPage,
            'page[limit]': this.isInfiniteScrollEnabled() ? this.model.INFINITE_SCROLL_CHUNK_SIZE : this.runsPerPage,
        };

        const endpoint = `/api/runs?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            if (this.isInfiniteScrollEnabled()) {
                const payload = this.runs && this.runs.payload ? [...this.runs.payload, ...result.data] : result.data;
                this.runs = RemoteData.success(payload);
            } else {
                this.runs = RemoteData.success(result.data);
            }

            this.totalPages = result.meta.page.pageCount;
        } else {
            this.runs = RemoteData.failure(result.errors || [{ title: result.error, detail: result.message }]);
        }

        this.notify();
    }

    /**
     * Retrieve a specified run from the API
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchOneRun(id) {
        this.run = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/runs/${id}`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.run = RemoteData.success(result.data);
            this.tags = this.run.payload.tags.map(({ id }) => id);
        } else {
            this.run = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }

    /**
     * Send updated RUN to be saved
     * @returns {undefined} Injects the data object with the response data
     */
    async updateOneRun() {
        const { id } = this.run.payload;
        this.run = RemoteData.loading();
        this.notify();

        const options = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.runChanges),
        };
        const response = await fetchClient(`/api/runs/${id}`, options);
        const result = await response.json();

        if (result.data) {
            this.run = RemoteData.success(result.data);
        } else {
            this.run = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }

    /**
     * Retrieve all associated logs for a specified run from the API
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchLogsOfRun(id) {
        this.logsOfRun = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/runs/${id}/logs`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.logsOfRun = RemoteData.success(result.data);
        } else {
            this.logsOfRun = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }

    /**
     * Retrieve all associated logs for a specified run from the API
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchFlpsOfRun(id) {
        this.flpsOfRun = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/runs/${id}/flps`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.flpsOfRun = RemoteData.success(result.data);
        } else {
            this.flpsOfRun = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }

    /**
     * Filter runs based on the selected run numbers and fields to prepare it for export
     * @param {Object} runs The runs data
     * @returns {Object} The Filtered runs data
     */
    async getFilteredRuns(runs) {
        const selectedRuns = runs.filter((run) => this.getSelectedRunNumbers().includes(run.runNumber));
        const filteredRuns = selectedRuns.map((selectedRun) => pick(selectedRun, this.getSelectedRunsFields()));
        return filteredRuns;
    }

    /**
     * Create the export with the variables set in the model, handling errors appropriately
     * @param {Object} content The source content.
     * @param {String} fileName The name of the file including the output format.
     * @return {void}
     */
    async createRunsExport(content, fileName) {
        this.getSelectedExportType() == 'CSV' ?
            createCSVExport(content, `${fileName}.csv`, 'text/csv;charset=utf-8;')
            : createJSONExport(content, `${fileName}.json`, 'application/json');
    }

    /**
     * Getter for a singular run data
     * @returns {RemoteData} Returns a run
     */
    getRun() {
        return this.run;
    }

    /**
     * Getter for Logs data associated with a singular run
     * @returns {RemoteData} Returns the logs of a run
     */
    getLogsOfRun() {
        return this.logsOfRun;
    }

    /**
     * Getter for Logs data associated with a singular run
     * @returns {RemoteData} Returns the logs of a run
     */
    getFlpsOfRun() {
        return this.flpsOfRun;
    }

    /**
     * Getter for all the run data
     * @returns {RemoteData} Returns all of the filtered runs
     */
    getRuns() {
        return this.runs;
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
     * Getter for run numbers
     * @returns {string} The run numbers
     */
    getRunNumbers() {
        return this.runNumbers;
    }

    /**
     * Getter for the currently selected page
     * @returns {Number} The currently selected page
     */
    getSelectedPage() {
        return this.selectedPage;
    }

    /**
     * Get the field values that will be exported
     * @returns {Array} the field objects of the current export being created
     */
    getSelectedRunsFields() {
        return this.selectedRunsFields;
    }

    /**
     * Get the run numbers of the runs that will be exported
     * @returns {Array} the field objects of the current export being created
     */
    getSelectedRunNumbers() {
        return this.selectedRunNumbers;
    }

    /**
     * Get the output format of the export
     * @returns {Array} the field objects of the current export being created
     */
    getSelectedExportType() {
        return this.selectedExportType;
    }

    /**
     * Returns all filtering, sorting and pagination settings to their default values
     * @param {Boolean} fetch Whether to refetch all logs after filters have been reset
     * @return {undefined}
     */
    resetRunsParams(fetch = true) {
        this.expandedFilters = [];
        this.activeFilters = [];

        this.runFilterDebounce = null;
        this.runFilterOperation = 'AND';
        this.runFilterValues = '';
        this.moreRuns = false;

        this.tagFilterOperation = 'AND';
        this.tagFilterValues = [];
        this.moreTags = false;

        this.o2startFilterFrom = '';
        this.o2startFilterTo = '';
        this.o2startFilterDebounce = null;

        this.o2endFilterFrom = '';
        this.o2endFilterTo = '';
        this.o2endFilterDebounce = null;

        this.enviromentIdFilter = '';
        this.envFilterDebounce = null;

        this.runQualityFilter = '';
        this.runQualityFilterDebounce = null;

        this.nDetectorsFilterValues = '';
        this.nDetectorsDebounce = null;

        this.nFlpsFilterValues = '';
        this.nFlpsDebounce = null;

        this.ddflpFilter = '';
        this.ddflpDebounce = null;

        this.dcsFilter = '';
        this.dcsDebounce = null;

        this.epnFilter = '';
        this.epnDebounce = null;

        this.epnTopologyFilterValues = '';
        this.epnTopologyDebounce = null;

        this.detectorsFilterValues = '';
        this.detectorsDebounce = null;

        this.sortingColumn = '';
        this.sortingOperation = '';
        this.sortingPreviewColumn = '';
        this.sortingPreviewOperation = '';

        this.amountDropdownVisible = false;
        this.rowCountFixed = false;
        this.logsPerPage = 10;
        this.selectedPage = 1;
        this.totalPages = 1;

        if (fetch) {
            this.fetchAllRuns();
        }
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @returns {Boolean} If any filter is active
     */
    isAnyFilterActive() {
        return (
            this.runFilterValues !== ''
            || this.tagFilterValues.length !== 0
            || this.o2startFilterFrom !== ''
            || this.o2startFilterTo !== ''
            || this.o2endFilterFrom !== ''
            || this.o2endFilterTo !== ''
            || this.enviromentIdFilter !== ''
            || this.runQualityFilter !== ''
            || this.nDetectorsFilterValues !== ''
            || this.nFlpsFilterValues !== ''
            || this.ddflpFilter !== ''
            || this.dcsFilter !== ''
            || this.epnFilter !== ''
            || this.epnTopologyFilterValues !== ''
            || this.detectorsFilterValues !== ''
        );
    }

    /**
     * Returns active filters
     * @returns {array} array of active filters
     */
    getActiveFilters() {
        this.activeFilters = [];

        if (this.runFilterValues !== '') {
            this.activeFilters.push('Run Number');
        }
        if (this.tagFilterValues.length !== 0) {
            this.activeFilters.push('Tags');
        }
        if (this.o2startFilterFrom !== '') {
            this.activeFilters.push('O2 Start from');
        }
        if (this.o2startFilterTo !== '') {
            this.activeFilters.push('O2 Start to');
        }
        if (this.o2endFilterFrom !== '') {
            this.activeFilters.push('O2 End from');
        }
        if (this.o2endFilterTo !== '') {
            this.activeFilters.push('O2 End to');
        }
        if (this.enviromentIdFilter !== '') {
            this.activeFilters.push('Environment Id');
        }
        if (this.runQualityFilter !== '') {
            this.activeFilters.push('Run Quality');
        }
        if (this.nDetectorsFilterValues !== '') {
            this.activeFilters.push('# of detectors');
        }
        if (this.nFlpsFilterValues !== '') {
            this.activeFilters.push('# of flps');
        }
        if (this.ddflpFilter !== '') {
            this.activeFilters.push('Data Distribution (FLP)');
        }
        if (this.dcsFilter !== '') {
            this.activeFilters.push('DCS');
        }
        if (this.epnFilter !== '') {
            this.activeFilters.push('EPN');
        }
        if (this.epnTopologyFilterValues !== '') {
            this.activeFilters.push('Epn topology');
        }
        if (this.detectorsFilterValues !== '') {
            this.activeFilters.push('Detectors');
        }

        return this.activeFilters;
    }

    /**
     * Getter for total pages
     * @returns {Number} Returns the total amount of pages available for the page selector
     */
    getTotalPages() {
        return this.totalPages;
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
            if (amount === Infinity) {
                this.infiniteScrollEnabled = true;
                // Set step for incremental loading
                this.runsPerPage = 19;
            } else {
                this.infiniteScrollEnabled = false;
                this.runsPerPage = amount;
            }
            this.selectedPage = 1;
            this.fetchAllRuns();
        }

        this.amountDropdownVisible = false;
    }

    /**
     * Set the runNumbers parameter of the current export being created
     * @param {string} selectedRunNumbers Received string from the view
     * @return {void}
     */
    setSelectedRunNumbers(selectedRunNumbers) {
        this.selectedRunNumbers = selectedRunNumbers;
        this.notify();
    }

    /**
     * Set the export type parameter of the current export being created
     * @param {string} selectedExportType Received string from the view
     * @return {void}
     */
    setSelectedExportType(selectedExportType) {
        this.selectedExportType = selectedExportType;
        this.notify();
    }

    /**
     * Saves custom per page value
     * @param {Number} amount The amount of runs that should be shown per page
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
            this.fetchAllRuns();
            this.notify();
        }
    }

    /**
     * Updates the selected fields ID array according to the HTML attributes of the options
     * @param {HTMLCollection} selectedOptions The currently selected fields by the user,
     * according to HTML specification
     * @returns {undefined}
     */
    setSelectedRunsFields(selectedOptions) {
        this.selectedRunsFields = [];
        [...selectedOptions].map((selectedOption) =>
            this.selectedRunsFields.push(selectedOption.value));
        this.notify();
    }

    /**
     * Sets the run data to default and either sets the logs or flps data to not asked based on the active tab.
     * @param {String} id of the tab
     * @return {undefined}
     */
    switchTab(id) {
        this.run = RemoteData.NotAsked();

        if (id == 'flps') {
            this.logsOfRun = RemoteData.NotAsked();
        } else {
            this.flpsOfRun = RemoteData.NotAsked();
        }
    }

    /**
     * Sets all data related to a run to their defaults.
     * @returns {undefined}
     */
    clearRun() {
        this.run = RemoteData.NotAsked();
        this.logsOfRun = RemoteData.NotAsked();
        this.flpsOfRun = RemoteData.NotAsked();
    }

    /**
     * Sets all data related to the runs to their defaults.
     * @returns {undefined}
     */
    clearRuns() {
        this.runs = RemoteData.NotAsked();
        this.collapsedColumns = [];
        this.collapsableColumns = [];

        this.expandedFilters = [];

        this.amountDropdownVisible = false;
        this.runsPerPage = 10;
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
     * Clear all editors in the model
     * @returns {void}
     */
    clearAllEditors() {
        this.tags = [];
        this.tagsChanged = false;
    }

    /**
     * Updates the selected tag ID array according to the HTML attributes of the options
     * @param {HTMLCollection} selectedOptions The currently selected tags by the user, according to HTML specification
     * @returns {void}
     */
    setSelectedTags(selectedOptions) {
        const selectedTagsIds = Array.from(selectedOptions)
            .map(({ value }) => parseInt(value, 10))
            .sort((a, b) => a - b);
        if (!selectedTagsIds.every((value, i) => value === this.tags[i])
            || selectedTagsIds.length === 0) {
            this.tags = selectedTagsIds;
            this.tagsChanged = true;
            this.notify();
        }
    }

    /**
     * Get the tag values of the current run being edited
     * @returns {Array} the tag objects of the current run being edited
     */
    getSelectedTags() {
        return this.tags;
    }

    /**
     * Get the current state of tags: if they were changed by user or not
     * @return {boolean} if tags were changed by user or not
     */
    selectedTagsChanged() {
        return this.tagsChanged;
    }

    /**
     * Update (overwrite) run tags
     * @return {void}
     */
    async updateRunTags() {
        const { id } = this.run.payload;
        const tags = this.getSelectedTags();

        this.run = RemoteData.loading();
        this.notify();

        const options = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tags,
            }),
        };
        const response = await fetchClient(`/api/runs/${id}`, options);
        const result = await response.json();

        if (result.data) {
            this.run = RemoteData.success(result.data);
            this.tags = this.run.payload.tags.map(({ id }) => id);
        } else {
            RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.tagsChanged = false;
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
     * Returns the current runNumber substring filter
     * @returns {String} The current runNumber substring filter
     */
    getRunNumberFilter() {
        return this.runFilterValues;
    }

    /**
     * Sets the run Number substring filter if no new inputs were detected for 200 milliseconds
     * @param {String} runs The number of the run to apply to the filter
     * @returns {undefined}
     */
    setRunsFilter(runs) {
        clearTimeout(this.runFilterDebounce);
        this.runFilterDebounce = setTimeout(() => {
            this.runFilterValues = runs.trim();
            this.fetchAllRuns();
        }, 200);
    }

    /**
     * Remove a run from the filter
     * @param {string} targetRun The run that should be removed
     * @returns {undefined}
     */
    removeRunFromFilter(targetRun) {
        this.runFilterValues = this.runFilterValues.filter((run) => run !== targetRun);
        this.fetchAllRuns();
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
     * Getter for the filter operation of runs
     * @returns {String} The filter operation to be performed on the runs (AND, OR)
     */
    getRunFilterOperation() {
        return this.runFilterOperation;
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
     * Getter for the filter operation of tags
     * @returns {String} The filter operation to be performed on the tags (AND, OR)
     */
    getTagFilterOperation() {
        return this.tagFilterOperation;
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
     * Getter for show more tags criteria
     * @returns {Boolean} Returns if more tags should be shown above the predefined limit
     */
    shouldShowMoreTags() {
        return this.moreTags;
    }

    /**
     * Returns the current minimum creation datetime
     * @returns {Integer} The current minimum creation datetime
     */
    getO2startFilterFrom() {
        return this.o2startFilterFrom;
    }

    /**
     * Returns the current maximum creation datetime
     * @returns {Integer} The current maximum creation datetime
     */
    getO2startFilterTo() {
        return this.o2startFilterTo;
    }

    /**
     * Set a datetime for the creation datetime filter
     * @param {String} key The filter value to apply the datetime tosetDdflpFilterOperation
     * @param {Object} date The datetime to be applied to the creation datetime filter
     * @param {Boolean} valid Whether the inserted date passes validity checksetDdflpFilterOperation
     * @returns {undefined}
     */
    setO2startFilter(key, date, valid) {
        if (valid) {
            this[`o2startFilter${key}`] = date;
            this.fetchAllRuns();
        }
    }

    /**
     * Set a datetime for the creation datetime filter, with a debounce delay
     * @param {String} key The filter value to apply the datetime to
     * @param {Object} date The datetime to be applied to the creation datetime filter
     * @param {Boolean} valid Whether the inserted date passes validity check
     * @returns {undefined}
     */
    setO2startFilterWithDebounce(key, date, valid) {
        clearTimeout(this.o2startFilterDebounce);
        this.o2startFilterDebounce = setTimeout(() => this.setO2startFilter(key, date, valid), 200);
    }

    /**
     * Returns the current minimum creation datetime
     * @returns {Integer} The current minimum creation datetime
     */
    getO2endFilterFrom() {
        return this.o2endFilterFrom;
    }

    /**
     * Returns the current maximum creation datetime
     * @returns {Integer} The current maximum creation datetime
     */
    getO2endFilterTo() {
        return this.o2endFilterTo;
    }

    /**
     * Set a datetime for the creation datetime filter
     * @param {String} key The filter value to apply the datetime to
     * @param {Object} date The datetime to be applied to the creation datetime filter
     * @param {Boolean} valid Whether the inserted date passes validity check
     * @returns {undefined}
     */
    setO2endFilter(key, date, valid) {
        if (valid) {
            this[`o2endFilter${key}`] = date;
            this.fetchAllRuns();
        }
    }

    /**
     * Set a datetime for the creation datetime filter, with a debounce delay
     * @param {String} key The filter value to apply the datetime to
     * @param {Object} date The datetime to be applied to the creation datetime filter
     * @param {Boolean} valid Whether the inserted date passes validity check
     * @returns {undefined}
     */
    setO2endFilterWithDebounce(key, date, valid) {
        clearTimeout(this.o2endFilterDebounce);
        this.o2endFilterDebounce = setTimeout(() => this.setO2endFilter(key, date, valid), 200);
    }

    /**
     * Returns the current environmentId substring filter
     * @returns {String} The current environmentId substring filter
     */
    getEnvFilter() {
        return this.enviromentIdFilter;
    }

    /**
     * Sets the environmentId substring filter if no new inputs were detected for 200 milliseconds
     * @param {String} newEnvironment The environmentId substring to apply to the filter
     * @returns {undefined}
     */
    setEnvironmentIdFilter(newEnvironment) {
        clearTimeout(this.envFilterDebounce);
        this.envFilterDebounce = setTimeout(() => {
            this.enviromentIdFilter = newEnvironment.trim();
            this.fetchAllRuns();
        }, 200);
    }

    /**
     * Returns the current run quality substring filter
     * @returns {String} The current run quality substring filter
     */
    getRunQualityFilter() {
        return this.runQualityFilter;
    }

    /**
     * Sets the run quality substring filter if no new inputs were detected for 200 milliseconds
     * @param {String} newRunQuality The environmentId substring to apply to the filter
     * @returns {undefined}
     */
    setRunQualityFilter(newRunQuality) {
        clearTimeout(this.envFilterDebounce);
        this.runQualityFilterDebounce = setTimeout(() => {
            this.runQualityFilter = newRunQuality.trim();
            this.fetchAllRuns();
        }, 200);
    }

    /**
     * Returns the amount of detectors filter
     * @returns {String} The current amount of detectors filter
     */
    getnDetectorsFilter() {
        return this.nDetectorsFilterValues;
    }

    /**
     * Sets the amount of detectors filter if no new inputs were detected for 200 milliseconds
     * @param {String} newNDetectors The amount of detectors to apply to the filter
     * @returns {undefined}
     */
    setnDetectorsFilter(newNDetectors) {
        clearTimeout(this.envFilterDebounce);
        this.envFilterDebounce = setTimeout(() => {
            this.nDetectorsFilterValues = newNDetectors.trim();
            this.fetchAllRuns();
        }, 200);
    }

    /**
     * Returns the current amount of flps filter
     * @returns {String} The current amount of flps filter
     */
    getnFlpsFilter() {
        return this.nFlpsFilterValues;
    }

    /**
     * Sets the amount of flps filter if no new inputs were detected for 200 milliseconds
     * @param {String} newNFlps The amount of flps to apply to the filter
     * @returns {undefined}
     */
    setnFlpsFilter(newNFlps) {
        clearTimeout(this.nFlpsDebounce);
        this.nFlpsDebounce = setTimeout(() => {
            this.nFlpsFilterValues = newNFlps.trim();
            this.fetchAllRuns();
        }, 200);
    }

    /**
     * Returns the boolean of ddflp
     * @returns {Boolean} if ddflp is on
     */
    getDdflpFilterOperation() {
        return this.ddflpFilter;
    }

    /**
     * Sets the boolean of the filter if no new inputs were detected for 200 milliseconds
     * @param {Boolean} operation if the ddflp is on
     * @returns {undefined}
     */
    setDdflpFilterOperation(operation) {
        clearTimeout(this.ddflpDebounce);
        this.ddflpDebounce = setTimeout(() => {
            this.ddflpFilter = operation;
            this.fetchAllRuns();
        }, 200);
    }

    /**
     * Unchecks the ddflp checkbox and fetches all the runs.
     * @returns {undefined}
     *
     */
    removeDdflp() {
        this.ddflpFilter = '';
        this.fetchAllRuns();
    }

    /**
     * Returns the boolean of dcs
     * @returns {Boolean} if dcs is on
     */
    getDcsFilterOperation() {
        return this.dcsFilter;
    }

    /**
     * Sets the boolean of the filter if no new inputs were detected for 200 milliseconds
     * @param {Boolean} operation if the dcs is on
     * @returns {undefined}
     */
    setDcsFilterOperation(operation) {
        clearTimeout(this.dcsDebounce);
        this.dcsDebounce = setTimeout(() => {
            this.dcsFilter = operation;
            this.fetchAllRuns();
        }, 200);
    }

    /**
     * Unchecks the dcs checkbox and fetches all the runs.
     * @returns {undefined}
     */
    removeDcs() {
        this.dcsFilter = '';
        this.fetchAllRuns();
    }

    /**
     * Returns the boolean of epn
     * @returns {Boolean} if epn is on
     */
    getEpnFilterOperation() {
        return this.epnFilter;
    }

    /**
     * Sets the boolean of the filter if no new inputs were detected for 200 milliseconds
     * @param {Boolean} operation if the epn is on
     * @returns {undefined}
     */
    setEpnFilterOperation(operation) {
        clearTimeout(this.epnDebounce);
        this.epnDebounce = setTimeout(() => {
            this.epnFilter = operation;
            this.fetchAllRuns();
        }, 200);
    }

    /**
     * Unchecks the epn checkbox and fetches all the runs.
     * @returns {undefined}
     */
    removeEpn() {
        this.epnFilter = null;
        this.fetchAllRuns();
    }

    /**
     * Returns the current epnTopology substring filter
     * @returns {String} The current epnTopology substring filter
     */
    getEpnTopologyFilter() {
        return this.epnTopologyFilter;
    }

    /**
     * Sets the epnTopology substring filter if no new inputs were detected for 200 milliseconds
     * @param {String} newTopology The epnTopology substring to apply to the filter
     * @returns {undefined}
     */
    setEpnTopologyFilter(newTopology) {
        clearTimeout(this.epnTopologyDebounce);
        this.epnTopologyDebounce = setTimeout(() => {
            this.epnTopologyFilter = newTopology.trim();
            this.fetchAllRuns();
        }, 200);
    }

    /**
     * Returns the current Detectors substring filter
     * @returns {String} The current Detectors substring filter
     */
    getDetectorsFilter() {
        return this.detectorsFilterValues;
    }

    /**
     * Sets the Detectors substring filter if no new inputs were detected for 200 milliseconds
     * @param {String} newDetectors The Detectors substring to apply to the filter
     * @returns {undefined}
     */
    setDetectorsFilter(newDetectors) {
        clearTimeout(this.detectorsDebounce);
        this.detectorsDebounce = setTimeout(() => {
            this.detectorsFilterValues = newDetectors.trim();
            this.fetchAllRuns();
        }, 200);
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
     * Return if the edit mode is enabled or not
     */
    get isEditModeEnabled() {
        return this._isEditModeEnabled;
    }

    /**
     * Set the value of the edit mode of a Run and update the watchers
     * @param {boolean} value parameter to specify if user is in edit mode
     */
    set isEditModeEnabled(value) {
        this._isEditModeEnabled = value ? true : false;
        this.notify();
    }

    /**
     * Return the changes that user applied while in Edit Mode
     */
    get runChanges() {
        return this._runChanges;
    }

    /**
     * Method to update the property of a run;
     * If there is a missing key and value, all changes will be dropped
     * @param {JSON} object containing a key and a value which represent the property of the run that is being changed
     */
    set runChanges({ key, value }) {
        if (!key && !value) {
            this._runChanges = {};
        } else {
            this._runChanges[key] = value;
        }
        this.notify();
    }
}
