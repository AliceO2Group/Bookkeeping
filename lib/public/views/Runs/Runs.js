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
import { PickerModel } from '../../components/common/picker/PickerModel.js';
import { debounce, INPUT_DEBOUNCE_TIME } from '../../utilities/debounce.js';
import { taggedEventRegistry } from '../../utilities/taggedEventRegistry.js';
import { FILTER_PANEL_CLICK_TAG } from '../../components/Filters/filtersConstants.js';
import { PaginationModel } from '../../components/Pagination/PaginationModel.js';
import { parseFetchResponse } from '../../utilities/parseFetchResponse.js';
import { tagToOption } from '../../components/tag/tagToOption.js';

/**
 * Model representing handlers for runs page
 *
 * @implements {OverviewModel}
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
        this._listingTagsFilterModel.observe(() => this._applyFilters(true));

        this.editionTagPickerModel = new PickerModel();

        this._listingRunTypesFilterModel = new PickerModel();
        this._listingRunTypesFilterModel.observe(() => this._applyFilters(true));

        this._pagination = new PaginationModel();
        this._pagination.observe(() => this.fetchAllRuns());
        this._pagination.itemsPerPageSelector$.observe(() => this.notify());

        // Content
        this._currentPageRuns = RemoteData.notAsked();
        this._allRuns = RemoteData.notAsked();

        // Register tagged event listener to close filter if click outside
        taggedEventRegistry.addListenerForAnyExceptTagged(() => this.setShowFilters(false), FILTER_PANEL_CLICK_TAG);

        this.clearRun();

        this.clearAllEditors();
        this.reset(false);

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
        const concatenateWith = !clear
                                && this._pagination.currentPage !== 1
                                && this._pagination.isInfiniteScrollEnabled ? this._currentPageRuns.payload || [] : null;
        if (!this._pagination.isInfiniteScrollEnabled) {
            this._currentPageRuns = RemoteData.loading();
            this.notify();
        }
        this._allRuns = RemoteData.notAsked();

        const params = {
            ...this._getFilterQueryParams(),
            'page[offset]': this._pagination.firstItemOffset,
            'page[limit]': this._pagination.itemsPerPage,
        };

        const endpoint = `/api/runs?${new URLSearchParams(params).toString()}`;
        const response = await fetchClient(endpoint, { method: 'GET' });

        const { remoteData, totalCount } = await parseFetchResponse(
            response,
            concatenateWith,
        );

        this._currentPageRuns = remoteData;
        if (remoteData.isSuccess()) {
            this._pagination.itemsCount = totalCount;
            this.totalRunsCount = totalCount || this.totalRunsCount;
        }

        this.notify();
    }

    /**
     * Retrieve a specified run from the API
     * @param {Number} id The ID of the run to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchOneRun(id) {
        this._run = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/runs/${id}`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this._run = RemoteData.success(result.data);
            this.editionTagPickerModel = new PickerModel(this._run.payload.tags.map(tagToOption));
        } else {
            this._run = RemoteData.failure(result.errors || [
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
        const { id } = this._run.payload;
        this._run = RemoteData.loading();
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
            this._run = RemoteData.success(result.data);
            this.editionTagPickerModel = new PickerModel(this._run.payload.tags.map(tagToOption));
        } else {
            this._run = RemoteData.failure(result.errors || [
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
     *
     * @returns {RemoteData} Returns a run
     * @deprecated use js native getter instead
     */
    getRun() {
        return this._run;
    }

    /**
     * Getter for the current run
     *
     * @return {RemoteData} the run
     */
    get run() {
        return this._run;
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
     * Get the field values that will be exported
     * @returns {Array} the field objects of the current export being created
     */
    getSelectedRunsFields() {
        return this.selectedRunsFields;
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
    reset(fetch = true) {
        this.activeFilters = [];

        this.runFilterOperation = 'AND';
        this.runFilterValues = '';
        this._runDefinitionFilter = [];

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

        this._runTypesFilter = [];
        this._runDurationFilter = null;

        this._lhcPeriodsFilter = null;

        this.environmentIdsFilter = '';

        this.runQualitiesFilters = [];

        this._triggerValuesFilters = new Set();

        this.nDetectorsFilter = null;

        this._nEpnsFilter = null;

        this.nFlpsFilter = null;

        this.ddflpFilter = '';

        this.dcsFilter = '';

        this.epnFilter = '';

        this._odcTopologyFullNameFilter = '';

        this.detectorsFilterValues = '';

        this._pagination.reset();

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
            || this._runDefinitionFilter.length > 0
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
            || this._lhcPeriodsFilter !== null
            || this.environmentIdsFilter !== ''
            || this.runQualitiesFilters.length !== 0
            || this._triggerValuesFilters.size !== 0
            || this.nDetectorsFilter !== null
            || this._nEpnsFilter !== null
            || this.nFlpsFilter !== null
            || this.ddflpFilter !== ''
            || this.dcsFilter !== ''
            || this.epnFilter !== ''
            || this._odcTopologyFullNameFilter !== ''
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
        if (this._runDefinitionFilter.length > 0) {
            this.activeFilters.push('Run Definition');
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
        if (this._lhcPeriodsFilter !== null) {
            this.activeFilters.push('LHC Period');
        }
        if (this.environmentIdsFilter !== '') {
            this.activeFilters.push('Environment Id');
        }
        if (this.runQualitiesFilters.length !== 0) {
            this.activeFilters.push('Run Quality');
        }
        if (this._triggerValuesFilters.size !== 0) {
            this.activeFilters.push('Trigger Value');
        }
        if (this.nDetectorsFilter !== null) {
            this.activeFilters.push('# of detectors');
        }
        if (this._nEpnsFilter !== null) {
            this.activeFilters.push('# of epns');
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
        if (this._odcTopologyFullNameFilter !== '') {
            this.activeFilters.push('Topology');
        }
        if (this.detectorsFilterValues !== '') {
            this.activeFilters.push('Detectors');
        }

        return this.activeFilters;
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
     *
     * @param {String} id of the tab
     * @return {undefined}
     */
    switchTab(id) {
        this._run = RemoteData.NotAsked();

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
        this._run = RemoteData.NotAsked();
        this.reasonTypes = RemoteData.NotAsked();
        this.logsOfRun = RemoteData.NotAsked();
        this.flpsOfRun = RemoteData.NotAsked();
        this._runType = RemoteData.NotAsked();
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
     * States if the given definition is currently in the run definition filter
     *
     * @param {string} definition the run definition to look for
     * @return {boolean} true if the definition is included in the filter
     */
    isDefinitionInFilter(definition) {
        return this._runDefinitionFilter.includes(definition);
    }

    /**
     * Add a given definition in the current run definition filter if it is not already present, then refresh runs list
     *
     * @param {string} definition the run definition to add
     * @return {void}
     */
    addDefinitionFilter(definition) {
        if (!this.isDefinitionInFilter(definition)) {
            this._runDefinitionFilter.push(definition);
            this._applyFilters();
        }
    }

    /**
     * Remove a given definition from the current run definition filter if it is in it (else do nothing) then refresh runs list
     *
     * @param {string} definition the definition to add
     * @return {void}
     */
    removeDefinitionFilter(definition) {
        this._runDefinitionFilter = this._runDefinitionFilter.filter((existingDefinition) => definition !== existingDefinition);
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
     * Getter for the trigger values filter Set
     * @returns {Set} set of trigger filter values
     */
    get triggerValuesFilters() {
        return this._triggerValuesFilters;
    }

    /**
     * Setter for trigger values filter, this replaces the current set
     * @param {Array} newTriggerValues new Set of values
     * @returns {undefined}
     */
    set triggerValuesFilters(newTriggerValues) {
        this._triggerValuesFilters = new Set(newTriggerValues);
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
     * Returns the current amount of epns filter
     * @returns {{operator: string, limit: (number|null)}|null} The current amount of epns filters
     */
    get nEpnsFilter() {
        return this._nEpnsFilter;
    }

    /**
     * Returns the current amount of flps filter
     * @returns {{operator: string, limit: (number|null)}|null} The current amount of flps filters
     */
    getNFlpsFilter() {
        return this.nFlpsFilter;
    }

    /**
     * Sets the limit of epns and the comparison operator to filter if no new inputs were detected for 200 milliseconds
     *
     * @param {{operator: string, limit: (number|null)}|null} newNEpns The new filter value
     *
     * @returns {void}
     */
    set nEpnsFilter(newNEpns) {
        this._nEpnsFilter = newNEpns;
        this._applyFilters();
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
    get odcTopologyFullNameFilter() {
        return this._odcTopologyFullNameFilter;
    }

    /**
     * Sets the epnTopology substring filter if no new inputs were detected for 200 milliseconds
     * @param {String} newTopology The epnTopology substring to apply to the filter
     * @returns {undefined}
     */
    set odcTopologyFullNameFilter(newTopology) {
        this._odcTopologyFullNameFilter = newTopology.trim();
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
     * Gets the lhc period filter value
     * @returns {string} lhc period filter value
     */
    get lhcPeriodsFilter() {
        return this._lhcPeriodsFilter;
    }

    /**
     * Sets the lhc period filter value
     * @param {string} value The lhc period value to filter on
     * @returns {undefined}
     */
    set lhcPeriodsFilter(value) {
        this._lhcPeriodsFilter = value;
        this._applyFilters();
    }

    /**
     * Returns whether the filter should be shown or not
     * @returns {Boolean} returns whether the filter should be shown
     */
    get areFiltersVisible() {
        return this.showFilters || false;
    }

    /**
     * Sets whether the filters are shown or not
     * @param {Boolean} showFilters Whether the filter should be shown
     * @returns {void}
     */
    setShowFilters(showFilters) {
        this.showFilters = showFilters;
        this.notify();
    }

    /**
     * Toggles whether the filters are shown
     * @returns {void}
     */
    toggleFiltersVisibility() {
        this.setShowFilters(!this.areFiltersVisible);
        this.notify();
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
        this._isEditModeEnabled = value;
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
     * Getter of run type
     * @returns {object} run Type object
     */
    get runType() {
        return this._runType;
    }

    /**
     * Setter for run type
     * @param {object} type The run type object
     */
    set runType(type) {
        this._runType = type;
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
     * @return {PickerModel} the picker model
     */
    get editionTagPickerModel() {
        return this._editionTagPickerModel;
    }

    /**
     * Set the current edition tag picker model and register required observers
     *
     * @param {PickerModel} editionTagPickerModel the new tag picker model
     */
    set editionTagPickerModel(editionTagPickerModel) {
        this._editionTagPickerModel = editionTagPickerModel;
        this._editionTagPickerModel.observe(() => {
            this.runChanges = { key: 'tags', value: this.editionTagPickerModel.selected };
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
     *
     * Getter for the run filter object
     * @returns {PickerModel} A tag filter model used to get
     */
    get listingRunTypesFilterModel() {
        return this._listingRunTypesFilterModel;
    }

    /**
     * Returns the pagination model
     *
     * @return {PaginationModel} the pagination model
     */
    get pagination() {
        return this._pagination;
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
            ...this._runDefinitionFilter.length > 0 && {
                'filter[definitions]': this._runDefinitionFilter.join(','),
            },
            ...!this.listingTagsFilterModel.isEmpty() && {
                'filter[tags][values]': this.listingTagsFilterModel.selected.join(),
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
                // Convert filter to milliseconds
                'filter[runDuration][limit]': this._runDurationFilter.limit * 60 * 1000,
            },
            ...this._lhcPeriodsFilter && {
                'filter[lhcPeriods]': this._lhcPeriodsFilter,
            },
            ...this.environmentIdsFilter && {
                'filter[environmentIds]': this.environmentIdsFilter,
            },
            ...this.runQualitiesFilters.length !== 0 && {
                'filter[runQualities]': this.runQualitiesFilters.join(),
            },
            ...this._triggerValuesFilters.size !== 0 && {
                'filter[triggerValues]': Array.from(this._triggerValuesFilters).join(),
            },
            ...this.nDetectorsFilter && this.nDetectorsFilter.limit !== null && {
                'filter[nDetectors][operator]': this.nDetectorsFilter.operator,
                'filter[nDetectors][limit]': this.nDetectorsFilter.limit,
            },
            ...this.nFlpsFilter && this.nFlpsFilter.limit !== null && {
                'filter[nFlps][operator]': this.nFlpsFilter.operator,
                'filter[nFlps][limit]': this.nFlpsFilter.limit,
            },
            ...this.nEpnsFilter && this.nEpnsFilter.limit !== null && {
                'filter[nEpns][operator]': this.nEpnsFilter.operator,
                'filter[nEpns][limit]': this.nEpnsFilter.limit,
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
            ...this._odcTopologyFullNameFilter && {
                'filter[odcTopologyFullName]': this._odcTopologyFullNameFilter,
            },
            ...this.detectorsFilterValues && {
                'filter[detectors]': this.detectorsFilterValues,
            },
            ...this._listingRunTypesFilterModel.selected.length > 0 && {
                'filter[runTypes]': this._listingRunTypesFilterModel.selected,
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
        this._pagination.currentPage = 1;
        now ? this.fetchAllRuns() : this._debouncedFetchAllRuns(true);
    }
}
