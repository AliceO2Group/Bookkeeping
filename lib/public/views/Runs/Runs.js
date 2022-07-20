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
import { createCSVExport, createJSONExport } from '../../utilities/export.js';
import { TagFilterModel } from '../../components/Filters/common/TagFilterModel.js';
import { TagPickerModel } from '../../components/pickers/tag/TagPickerModel.js';
import { parseFetchResponse } from '../../utilities/parseFetchResponse.js';
import { debounce, INPUT_DEBOUNCE_TIME } from '../../utilities/debounce.js';

/**
 * Model representing handlers for runs page
 */
export default class RunModel extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Object} model Pass the model to access the defined functions
     * @returns {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this.model = model;
        this.totalRunsCount = null;

        // Sub-models
        this._listingTagsFilterModel = new TagFilterModel();
        this._listingTagsFilterModel.observe(() => this._applyFilters());
        this.editionTagPickerModel = new TagPickerModel();

        // Content
        this._currentPageRuns = RemoteData.notAsked();
        this._allRuns = RemoteData.notAsked();

        this.clearRun();
        this.clearRuns();

        this.clearAllEditors();
        this.resetRunsParams(false);

        this._debouncedFetchAllRuns = debounce(this.fetchAllRuns.bind(this), INPUT_DEBOUNCE_TIME);
    }

    /**
     * Retrieve every relevant run from the API
     *
     * @param {boolean} clear if true, any previous data will be discarded, even in infinite mode
     *
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchAllRuns(clear = false) {
        const concatenateWith = !clear && this.isInfiniteScrollEnabled() ? this._currentPageRuns.payload || [] : null;
        if (!this.isInfiniteScrollEnabled()) {
            this._currentPageRuns = RemoteData.loading();
        }
        this._allRuns = RemoteData.notAsked();

        const params = {
            ...this._getFilterQueryParams(),
            'page[offset]': concatenateWith ? concatenateWith.length : (this.selectedPage - 1) * this.runsPerPage,
            'page[limit]': this.isInfiniteScrollEnabled() ? this.model.INFINITE_SCROLL_CHUNK_SIZE : this.runsPerPage,
        };

        const endpoint = `/api/runs?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });

        const { remoteData, pageCount, totalCount } = await parseFetchResponse(
            response,
            concatenateWith,
        );

        this._currentPageRuns = remoteData;
        this.totalPages = pageCount || this.totalPages;
        this.totalRunsCount = totalCount || this.totalRunsCount;

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
            this.editionTagPickerModel = new TagPickerModel(this.run.payload.tags);
        } else {
            this.run = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        // Invalidate allRuns cache
        this._allRuns = RemoteData.notAsked();
        this.notify();
    }

    /**
     * Retrieve a list of reason types from the API
     * @returns {undefined} Injects the list of reasons with response data
     */
    async fetchReasonTypes() {
        this.reasonTypes = RemoteData.loading();
        this.notify();

        const response = await fetchClient('/api/runs/reasonTypes', { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.reasonTypes = RemoteData.success(result.data);
        } else {
            this.reasonTypes = RemoteData.failure(result.errors || [
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
            this.editionTagPickerModel = new TagPickerModel(this.run.payload.tags);
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
     * Fetches fill
     * @returns {undefined}
     */
    async fetchLhcFill() {
        const id = this.run.isSuccess() && this.run.payload.fillNumber
            ? this.run.payload.fillNumber : null;
        if (id) {
            this.lhcFill = RemoteData.loading();

            const response = await fetchClient(`/api/lhcFills/${id}`, { method: 'GET' });
            const result = await response.json();

            if (result.data) {
                this._lhcFill = RemoteData.success(result.data);
            } else {
                this._lhcFill = RemoteData.failure(result.errors || [
                    {
                        title: result.error,
                        detail: result.message,
                    },
                ]);
            }
        } else {
            this._lhcFill = RemoteData.success(null);
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
     * Create the export with the variables set in the model, handling errors appropriately
     * @param {Object} content The source content.
     * @param {String} fileName The name of the file including the output format.
     * @return {void}
     */
    async createRunsExport(content, fileName) {
        if (content.length > 0) {
            this.getSelectedExportType() === 'CSV'
                ? createCSVExport(content, `${fileName}.csv`, 'text/csv;charset=utf-8;')
                : createJSONExport(content, `${fileName}.json`, 'application/json');
        } else {
            this._currentPageRuns = RemoteData.failure([
                {
                    title: 'No data found',
                    detail: 'No valid runs were found for provided run number(s)',
                },
            ]);
            this.notify();
        }
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
     *
     * @returns {string} the output format
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

        this.runFilterOperation = 'AND';
        this.runFilterValues = '';

        this.listingTagsFilterModel.reset();

        this._fillNumbersFilter = '';

        this.o2startFilterFrom = '';
        this.o2startFilterTo = '';
        this.o2startFilterFromTime = '00:00';
        this.o2startFilterToTime = '23:59';

        this.o2endFilterFrom = '';
        this.o2endFilterTo = '';
        this.o2endFilterFromTime = '00:00';
        this.o2endFilterToTime = '23:59';

        this._runDurationFilter = null;

        this.environmentIdsFilter = '';

        this.runQualitiesFilters = [];

        this.nDetectorsFilter = null;

        this.nFlpsFilter = null;

        this.ddflpFilter = '';

        this.dcsFilter = '';

        this.epnFilter = '';

        this.epnTopologyFilterValues = '';

        this.detectorsFilterValues = '';

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
            this._applyFilters(true);
        }
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @returns {Boolean} If any filter is active
     */
    isAnyFilterActive() {
        return (
            this.runFilterValues !== ''
            || !this.listingTagsFilterModel.isEmpty()
            || this._fillNumbersFilter !== ''
            || this.o2startFilterFrom !== ''
            || this.o2startFilterTo !== ''
            || this.o2startFilterToTime !== '23:59'
            || this.o2startFilterFromTime !== '00:00'
            || this.o2endFilterFrom !== ''
            || this.o2endFilterTo !== ''
            || this.o2endFilterToTime !== '23:59'
            || this.o2endFilterFromTime !== '00:00'
            || this._runDurationFilter !== null
            || this.environmentIdsFilter !== ''
            || this.runQualitiesFilters.length !== 0
            || this.nDetectorsFilter !== null
            || this.nFlpsFilter !== null
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
        if (!this.listingTagsFilterModel.isEmpty()) {
            this.activeFilters.push('Tags');
        }
        if (this._fillNumbersFilter !== '') {
            this.activeFilters.push('Fill Number');
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
        if (this._runDurationFilter !== null) {
            this.activeFilters.push('Run duration');
        }
        if (this.environmentIdsFilter !== '') {
            this.activeFilters.push('Environment Id');
        }
        if (this.runQualitiesFilters.length !== 0) {
            this.activeFilters.push('Run Quality');
        }
        if (this.nDetectorsFilter !== null) {
            this.activeFilters.push('# of detectors');
        }
        if (this.nFlpsFilter !== null) {
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
            this.notify();
            this.fetchAllRuns();
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
        this.reasonTypes = RemoteData.notAsked();
        this.logsOfRun = RemoteData.NotAsked();
        this.flpsOfRun = RemoteData.NotAsked();
        this._lhcFill = RemoteData.NotAsked();
    }

    /**
     * Sets all data related to the runs to their defaults.
     * @returns {undefined}
     */
    clearRuns() {
        this._currentPageRuns = RemoteData.NotAsked();
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
        this.editionTagPickerModel.reset();
        this._isEditModeEnabled = false;
        this._runChanges = {};
        this.eorNewReason = {
            category: '',
            title: '',
            description: '',
        };
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
        this.runFilterValues = runs.trim();
        this._applyFilters();
    }

    /**
     * Return the currently applied fill number filter
     *
     * @return {string} the comma separated list of fill numbers
     */
    getFillNumbersFilter() {
        return this._fillNumbersFilter;
    }

    /**
     * Set the current fill number filter
     *
     * @param {string} fillNumbers the new fill numbers
     *
     * @return {void}
     */
    setFillNumbersFilter(fillNumbers) {
        this._fillNumbersFilter = fillNumbers.trim();
        this._applyFilters();
    }

    /**
     * Returns the current minimum creation date
     * @returns {number} The current minimum creation date
     */
    getO2startFilterFrom() {
        return this.o2startFilterFrom;
    }

    /**
     * Returns the current maximum creation date
     * @returns {number} The current maximum creation date
     */
    getO2startFilterTo() {
        return this.o2startFilterTo;
    }

    /**
     * Returns the current minimum creation time
     * @returns {number} The current minimum creation time
     */
    getO2startFilterFromTime() {
        return this.o2startFilterFromTime;
    }

    /**
     * Returns the current maximum creation time
     * @returns {number} The current maximum creation time
     */
    getO2startFilterToTime() {
        return this.o2startFilterToTime;
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
            this._applyFilters();
        }
    }

    /**
     * Returns the current minimum creation datetime
     * @returns {number} The current minimum creation datetime
     */
    getO2endFilterFrom() {
        return this.o2endFilterFrom;
    }

    /**
     * Returns the current maximum creation datetime
     * @returns {number} The current maximum creation datetime
     */
    getO2endFilterTo() {
        return this.o2endFilterTo;
    }

    /**
     * Returns the current minimum creation datetime
     * @returns {number} The current minimum creation datetime
     */
    getO2endFilterFromTime() {
        return this.o2endFilterFromTime;
    }

    /**
     * Returns the current maximum creation datetime
     * @returns {number} The current maximum creation datetime
     */
    getO2endFilterToTime() {
        return this.o2endFilterToTime;
    }

    /**
     * Set a datetime for the creation datetime filter
     * @param {string} key The filter value to apply the datetime to
     * @param {object} date The datetime to be applied to the creation datetime filter
     * @param {boolean} valid Whether the inserted date passes validity check
     * @returns {undefined}
     */
    setO2endFilter(key, date, valid) {
        if (valid) {
            this[`o2endFilter${key}`] = date;
            this._applyFilters();
        }
    }

    /**
     * Returns the run duration filter (filter is defined in minutes)
     * @returns {{operator: string, limit: (number|null)}|null} The current run duration filter
     */
    get runDurationFilter() {
        return this._runDurationFilter;
    }

    /**
     * Sets the limit of duration (in minutes) and the comparison operator to filter
     *
     * @param {{operator: string, limit: (number|null)}|null} newRunDurationFilter The new filter value
     *
     * @returns {void}
     */
    set runDurationFilter(newRunDurationFilter) {
        this._runDurationFilter = newRunDurationFilter;
        this._applyFilters();
    }

    /**
     * Returns the current environment id(s) filter
     * @returns {String} The current environment id(s) filter
     */
    getEnvFilter() {
        return this.environmentIdsFilter;
    }

    /**
     * Sets the environment id(s) filter if no new inputs were detected for 200 milliseconds
     * @param {String} newEnvironment The environment id(s) to apply to the filter
     * @returns {undefined}
     */
    setEnvironmentIdsFilter(newEnvironment) {
        this.environmentIdsFilter = newEnvironment.trim();
        this._applyFilters();
    }

    /**
     * States if the given run quality is currently in the run quality filter
     *
     * @param {string} runQuality the run quality to look for
     * @return {boolean} true if the run quality is included in the filter
     */
    isRunQualityInFilter(runQuality) {
        return this.runQualitiesFilters.includes(runQuality);
    }

    /**
     * Add a given run quality in the current run quality filter if it is not already present, then refresh runs list
     *
     * @param {string} runQuality the run quality to add
     * @return {void}
     */
    addRunQualityFilter(runQuality) {
        if (!this.isRunQualityInFilter(runQuality)) {
            this.runQualitiesFilters.push(runQuality);
            this._applyFilters();
        }
    }

    /**
     * Remove a given run quality from the current run quality filter if it is in it (else do nothing) then refresh
     * runs list
     *
     * @param {string} runQuality the run quality to add
     * @return {void}
     */
    removeRunQualityFilter(runQuality) {
        this.runQualitiesFilters = this.runQualitiesFilters.filter((existingRunQuality) => runQuality !== existingRunQuality);
        this._applyFilters();
    }

    /**
     * Returns the amount of detectors filters
     * @returns {{operator: string, limit: (number|null)}|null} The current amount of detectors filters
     */
    getNDetectorsFilter() {
        return this.nDetectorsFilter;
    }

    /**
     * Sets the limit of detectors and the comparison operator to filter if no new inputs were detected for 200
     * milliseconds
     *
     * @param {{operator: string, limit: (number|null)}|null} newNDetectors The new filter value
     *
     * @returns {void}
     */
    setNDetectorsFilter(newNDetectors) {
        this.nDetectorsFilter = newNDetectors;
        this._applyFilters();
    }

    /**
     * Returns the current amount of flps filter
     * @returns {{operator: string, limit: (number|null)}|null} The current amount of flps filters
     */
    getNFlpsFilter() {
        return this.nFlpsFilter;
    }

    /**
     * Sets the limit of flps and the comparison operator to filter if no new inputs were detected for 200 milliseconds
     *
     * @param {{operator: string, limit: (number|null)}|null} newNFlps The new filter value
     *
     * @returns {void}
     */
    setNFlpsFilter(newNFlps) {
        this.nFlpsFilter = newNFlps;
        this._applyFilters();
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
        this.ddflpFilter = operation;
        this._applyFilters();
    }

    /**
     * Unchecks the ddflp checkbox and fetches all the runs.
     * @returns {undefined}
     *
     */
    removeDdflp() {
        this.ddflpFilter = '';
        this._applyFilters();
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
        this.dcsFilter = operation;
        this._applyFilters();
    }

    /**
     * Unchecks the dcs checkbox and fetches all the runs.
     * @returns {undefined}
     */
    removeDcs() {
        this.dcsFilter = '';
        this._applyFilters();
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
        this.epnFilter = operation;
        this._applyFilters();
    }

    /**
     * Unchecks the epn checkbox and fetches all the runs.
     * @returns {undefined}
     */
    removeEpn() {
        this.epnFilter = '';
        this._applyFilters();
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
        this.epnTopologyFilter = newTopology.trim();
        this._applyFilters();
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
        this.detectorsFilterValues = newDetectors.trim();
        this._applyFilters();
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
     * @param {Object} object containing a key and a value which represent the property of the run that is being changed
     */
    set runChanges({ key, value }) {
        if (!key && !value) {
            this._runChanges = {};
        } else {
            this._runChanges[key] = value;
        }
        this.notify();
    }

    /**
     * Getter for lhcFill
     * @returns {Object} The lhcFill value
     */
    get lhcFill() {
        return this._lhcFill;
    }

    /**
     * Setter for lhcFill
     * @param {Object} fill The lhcFill value
     */
    set lhcFill(fill) {
        this._lhcFill = fill;
        this.notify();
    }

    /**
     * Check if an similar eor_reason exists already in the list and if not, adds it to the eorReasonChanges to be saved
     * @returns {undefined}
     */
    addEorReasonChange() {
        const { category, title, description } = this.eorNewReason;
        const isNew = this.runChanges.eorReasons.every((reason) =>
            reason.category !== category ||
            reason.title !== title ||
            reason.description !== description);
        if (isNew && category) {
            const reasonTypeIndex = this.reasonTypes.payload.findIndex((reason) => reason.category === category && reason.title === title);
            if (reasonTypeIndex > -1) {
                this.runChanges.eorReasons.push({
                    category,
                    title,
                    description,
                    reasonTypeId: this.reasonTypes.payload[reasonTypeIndex].id,
                    runId: this.model.router.params.id,
                    lastEditedName: this.model.session.name, // For now sent by front-end; To be moved on backend
                });
            }
        }
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
     * Returns the model handling the tag picking for run update
     *
     * @return {TagPickerModel} the picker model
     */
    get editionTagPickerModel() {
        return this._editionTagPickerModel;
    }

    /**
     * Set the current edition tag picker model and register required observers
     *
     * @param {TagPickerModel} editionTagPickerModel the new tag picker model
     */
    set editionTagPickerModel(editionTagPickerModel) {
        this._editionTagPickerModel = editionTagPickerModel;
        this._editionTagPickerModel.observe(() => {
            this.runChanges = { key: 'tags', value: this.editionTagPickerModel.selected.map((tag) => tag.text) };
        });
    }

    /**
     * Retro-compatibility access to paginated runs, returning all the runs contained in the current page if it applies
     *
     * @return {RemoteData} the runs in the current page
     */
    get runs() {
        return this._currentPageRuns;
    }

    /**
     * Return all the runs currently filtered, without paging
     *
     * @return {RemoteData} the remote data of the runs
     */
    get allRuns() {
        if (this._allRuns.isNotAsked()) {
            this._fetchAllRunsWithoutPaging();
        }

        return this._allRuns;
    }

    /**
     * States if the list of NOT paginated runs contains the full list of runs available under the given criteria
     *
     * @return {boolean|null} true if the runs list is not truncated (null if all runs are not yet available)
     */
    get isAllRunsTruncated() {
        const { allRuns } = this;
        if (!allRuns.isSuccess()) {
            return null;
        }
        return allRuns.payload.length < this.totalRunsCount;
    }

    /**
     * Returns the list of URL params corresponding to the currently applied filter
     *
     * @return {Object} the URL params
     *
     * @private
     */
    _getFilterQueryParams() {
        return {
            ...this.runFilterValues && {
                'filter[runNumbers]': this.runFilterValues,
            },
            ...!this.listingTagsFilterModel.isEmpty() && {
                'filter[tags][values]': this.listingTagsFilterModel.selected.map((tag) => tag.text).join(),
                'filter[tags][operation]': this.listingTagsFilterModel.combinationOperation.toLowerCase(),
            },
            ...this._fillNumbersFilter && {
                'filter[fillNumbers]': this._fillNumbersFilter,
            },
            ...this.o2startFilterFrom && {
                'filter[o2start][from]':
                    new Date(`${this.o2startFilterFrom.replace(/\//g, '-')}T${this.o2startFilterFromTime}:00.000`).getTime(),
            },
            ...this.o2startFilterTo && {
                'filter[o2start][to]':
                    new Date(`${this.o2startFilterTo.replace(/\//g, '-')}T${this.o2startFilterToTime}:59.999`).getTime(),
            },
            ...this.o2endFilterFrom && {
                'filter[o2end][from]':
                    new Date(`${this.o2endFilterFrom.replace(/\//g, '-')}T${this.o2endFilterFromTime}:00.000`).getTime(),
            },
            ...this.o2endFilterTo && {
                'filter[o2end][to]':
                    new Date(`${this.o2endFilterTo.replace(/\//g, '-')}T${this.o2endFilterToTime}:59.999`).getTime(),
            },
            ...this._runDurationFilter && this._runDurationFilter.limit !== null && {
                'filter[runDuration][operator]': this._runDurationFilter.operator,
                // Convert filter to miliseconds
                'filter[runDuration][limit]': this._runDurationFilter.limit * 60 * 1000,
            },
            ...this.environmentIdsFilter && {
                'filter[environmentIds]': this.environmentIdsFilter,
            },
            ...this.runQualitiesFilters.length !== 0 && {
                'filter[runQualities]': this.runQualitiesFilters.join(),
            },
            ...this.nDetectorsFilter && this.nDetectorsFilter.limit !== null && {
                'filter[nDetectors][operator]': this.nDetectorsFilter.operator,
                'filter[nDetectors][limit]': this.nDetectorsFilter.limit,
            },
            ...this.nFlpsFilter && this.nFlpsFilter.limit !== null && {
                'filter[nFlps][operator]': this.nFlpsFilter.operator,
                'filter[nFlps][limit]': this.nFlpsFilter.limit,
            },
            ...(this.ddflpFilter === true || this.ddflpFilter === false) && {
                'filter[ddflp]': this.ddflpFilter,
            },
            ...(this.dcsFilter === true || this.dcsFilter === false) && {
                'filter[dcs]': this.dcsFilter,
            },
            ...(this.epnFilter === true || this.epnFilter === false) && {
                'filter[epn]': this.epnFilter,
            },
            ...this.epnTopologyFilter && {
                'filter[epnTopology]': this.epnTopologyFilter,
            },
            ...this.detectorsFilterValues && {
                'filter[detectors]': this.detectorsFilterValues,
            },
        };
    }

    /**
     * Update the cache containing all the runs without paging
     *
     * @return {Promise<void>} void
     * @private
     */
    async _fetchAllRunsWithoutPaging() {
        if (this.runs.isSuccess() && this.runs.payload.length === this.totalRunsCount) {
            this._allRuns = RemoteData.success([...this.runs.payload]);
            this.notify();
            return;
        }
        this._allRuns = RemoteData.loading();
        this.notify();

        const params = this._getFilterQueryParams();

        const endpoint = `/api/runs?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });

        const { remoteData } = await parseFetchResponse(response);

        this._allRuns = remoteData;
        this.notify();
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
        now ? this.fetchAllRuns() : this._debouncedFetchAllRuns(true);
    }
}
