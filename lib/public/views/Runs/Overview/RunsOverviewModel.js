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

import { RemoteData } from '/js/src/index.js';
import { createCSVExport, createJSONExport } from '../../../utilities/export.js';
import { TagFilterModel } from '../../../components/Filters/common/TagFilterModel.js';
import { debounce } from '../../../utilities/debounce.js';
import { DetectorsFilterModel } from '../../../components/Filters/RunsFilter/DetectorsFilterModel.js';
import { RunTypesSelectionDropdownModel } from '../../../components/runTypes/RunTypesSelectionDropdownModel.js';
import { EorReasonFilterModel } from '../../../components/Filters/RunsFilter/EorReasonsFilterModel.js';
import pick from '../../../utilities/pick.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';
import { CombinationOperator } from '../../../components/Filters/common/CombinationOperatorChoiceModel.js';
import { AliceL3AndDipoleFilteringModel } from '../../../components/Filters/RunsFilter/AliceL3AndDipoleFilteringModel.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';
import { FloatComparisonFilterModel } from '../../../components/Filters/common/filters/FloatComparisonFilterModel.js';

/**
 * Model representing handlers for runs page
 *
 * @implements {OverviewModel}
 */
export class RunsOverviewModel extends OverviewPageModel {
    /**
     * The constructor of the Overview model object
     * @param {Model} model global model
     */
    constructor(model) {
        super();

        this._listingTagsFilterModel = new TagFilterModel([
            CombinationOperator.AND,
            CombinationOperator.OR,
            CombinationOperator.NONE_OF,
        ]);
        this._listingTagsFilterModel.observe(() => this._applyFilters(true));
        this._listingTagsFilterModel.visualChange$.bubbleTo(this);

        this._detectorsFilterModel = new DetectorsFilterModel(detectorsProvider.dataTaking$);
        this._detectorsFilterModel.observe(() => this._applyFilters(true));
        this._detectorsFilterModel.visualChange$.bubbleTo(this);

        this._listingRunTypesFilterModel = new RunTypesSelectionDropdownModel();
        this._listingRunTypesFilterModel.observe(() => this._applyFilters(true));
        this._listingRunTypesFilterModel.visualChange$.bubbleTo(this);

        this._eorReasonsFilterModel = new EorReasonFilterModel();
        this._eorReasonsFilterModel.observe(() => this._applyFilters());
        this._eorReasonsFilterModel.visualChange$.observe(() => this.notify());

        this._aliceL3AndDipoleCurrentFilter = new AliceL3AndDipoleFilteringModel();
        this._aliceL3AndDipoleCurrentFilter.observe(() => this._applyFilters());
        this._aliceL3AndDipoleCurrentFilter.visualChange$.bubbleTo(this);

        this._muInelasticInteractionRateFilterModel = new FloatComparisonFilterModel();
        this._muInelasticInteractionRateFilterModel.observe(() => this._applyFilters());
        this._muInelasticInteractionRateFilterModel.visualChange$.bubbleTo(this);

        this._inelasticInteractionRateAvgFilterModel = new FloatComparisonFilterModel();
        this._inelasticInteractionRateAvgFilterModel.observe(() => this._applyFilters());
        this._inelasticInteractionRateAvgFilterModel.visualChange$.bubbleTo(this);

        this._inelasticInteractionRateAtStartFilterModel = new FloatComparisonFilterModel();
        this._inelasticInteractionRateAtStartFilterModel.observe(() => this._applyFilters());
        this._inelasticInteractionRateAtStartFilterModel.visualChange$.bubbleTo(this);

        this._inelasticInteractionRateAtMidFilterModel = new FloatComparisonFilterModel();
        this._inelasticInteractionRateAtMidFilterModel.observe(() => this._applyFilters());
        this._inelasticInteractionRateAtMidFilterModel.visualChange$.bubbleTo(this);

        this._inelasticInteractionRateAtEndFilterModel = new FloatComparisonFilterModel();
        this._inelasticInteractionRateAtEndFilterModel.observe(() => this._applyFilters());
        this._inelasticInteractionRateAtEndFilterModel.visualChange$.bubbleTo(this);

        // Export items
        this._allRuns = RemoteData.NotAsked();

        this._cachedPdpBeamTypes = new Set();

        this.reset(false);
        // eslint-disable-next-line no-return-assign,require-jsdoc
        const updateDebounceTime = () => this._debouncedLoad = debounce(this.load.bind(this), model.inputDebounceTime);
        model.appConfiguration$.observe(() => updateDebounceTime());
        updateDebounceTime();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const paramsString = new URLSearchParams(this._getFilterQueryParams()).toString();
        return `/api/runs?${paramsString}`;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load() {
        this._allRuns = RemoteData.NotAsked();
        await super.load();
        this.items.match({
            Success: (runs) => {
                if (runs.some((run) => run.pdpBeamType === 'PbPb')) {
                    this._cachedPdpBeamTypes.add('PbPb');
                }
                if (runs.some((run) => run.pdpBeamType === 'pp')) {
                    this._cachedPdpBeamTypes.add('pp');
                }
            },
            Other: () => null,
        });
    }

    /**
     * Create the export with the variables set in the model, handling errors appropriately
     * @param {object[]} runs The source content.
     * @param {string} fileName The name of the file including the output format.
     * @param {Object<string, Function<*, string>>} exportFormats defines how particular fields of data units will be formatted
     * @return {void}
     */
    async createRunsExport(runs, fileName, exportFormats) {
        if (runs.length > 0) {
            const selectedRunsFields = this.getSelectedRunsFields() || [];
            runs = runs.map((selectedRun) => {
                const entries = Object.entries(pick(selectedRun, selectedRunsFields));
                const formattedEntries = entries.map(([key, value]) => {
                    const formatExport = exportFormats[key].exportFormat || ((identity) => identity);
                    return [key, formatExport(value, selectedRun)];
                });
                return Object.fromEntries(formattedEntries);
            });
            this.getSelectedExportType() === 'CSV'
                ? createCSVExport(runs, `${fileName}.csv`, 'text/csv;charset=utf-8;')
                : createJSONExport(runs, `${fileName}.json`, 'application/json');
        } else {
            this._observableItems.setCurrent(RemoteData.failure([
                {
                    title: 'No data found',
                    detail: 'No valid runs were found for provided run number(s)',
                },
            ]));
            this.notify();
        }
    }

    /**
     * Get the field values that will be exported
     * @return {Array} the field objects of the current export being created
     */
    getSelectedRunsFields() {
        return this.selectedRunsFields;
    }

    /**
     * Get the output format of the export
     *
     * @return {string} the output format
     */
    getSelectedExportType() {
        return this.selectedExportType;
    }

    /**
     * Returns all filtering, sorting and pagination settings to their default values
     * @param {boolean} fetch Whether to refetch all data after filters have been reset
     * @return {void}
     */
    reset(fetch = true) {
        super.reset();
        this.resetFiltering(fetch);
        this._cachedPdpBeamTypes = new Set();
    }

    /**
     * Reset all filtering models
     * @param {boolean} fetch Whether to refetch all data after filters have been reset
     * @return {void}
     */
    resetFiltering(fetch = true) {
        this.runFilterOperation = 'AND';
        this.runFilterValues = '';
        this._runDefinitionFilter = [];

        this._detectorsFilterModel.reset();
        this._listingTagsFilterModel.reset();
        this._listingRunTypesFilterModel.reset();
        this._eorReasonsFilterModel.reset();
        this._aliceL3AndDipoleCurrentFilter.reset();

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

        this._muInelasticInteractionRateFilterModel.reset();
        this._inelasticInteractionRateAvgFilterModel.reset();
        this._inelasticInteractionRateAtStartFilterModel.reset();
        this._inelasticInteractionRateAtMidFilterModel.reset();
        this._inelasticInteractionRateAtEndFilterModel.reset();

        if (fetch) {
            this._applyFilters(true);
        }
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @return {Boolean} If any filter is active
     */
    isAnyFilterActive() {
        return (
            this.runFilterValues !== ''
            || this._runDefinitionFilter.length > 0
            || !this._eorReasonsFilterModel.isEmpty()
            || !this._detectorsFilterModel.isEmpty()
            || !this._listingTagsFilterModel.isEmpty()
            || this._listingRunTypesFilterModel.selected.length !== 0
            || this._aliceL3AndDipoleCurrentFilter.selected.length !== 0
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
            || this._muInelasticInteractionRateFilterModel.isEmpty
            || this._inelasticInteractionRateAvgFilterModel.isEmpty
            || this._inelasticInteractionRateAtStartFilterModel.isEmpty
            || this._inelasticInteractionRateAtMidFilterModel.isEmpty
            || this._inelasticInteractionRateAtEndFilterModel.isEmpty
        );
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
     *
     * @param {HTMLCollection} selectedOptions The currently selected fields by the user,
     * according to HTML specification
     * @return {undefined}
     */
    setSelectedRunsFields(selectedOptions) {
        this.selectedRunsFields = [];
        [...selectedOptions].map((selectedOption) => this.selectedRunsFields.push(selectedOption.value));
        this.notify();
    }

    /**
     * Returns the current runNumber substring filter
     * @return {String} The current runNumber substring filter
     */
    getRunNumberFilter() {
        return this.runFilterValues;
    }

    /**
     * Sets the run Number substring filter if no new inputs were detected for 200 milliseconds
     * @param {string} runs The number of the run to apply to the filter
     * @return {undefined}
     */
    setRunsFilter(runs) {
        this.runFilterValues = runs.trim();
        this._applyFilters();
    }

    /**
     * States if the given definition is currently in the run definition filter, and it's the only one
     *
     * @param {string} definition the run definition to look for
     * @return {boolean} true if the definition is the only one currently applied
     */
    isDefinitionOnlyOneInFilter(definition) {
        return this._runDefinitionFilter.length === 1 && this._runDefinitionFilter[0] === definition;
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
     * Set the list of definition to be used as the current run definition filter
     *
     * @param {string[]} definitions the new definition filter
     * @return {void}
     */
    setDefinitionFilter(definitions) {
        this._runDefinitionFilter = [...definitions];
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
     * @return {number} The current minimum creation date
     */
    getO2startFilterFrom() {
        return this.o2startFilterFrom;
    }

    /**
     * Returns the current maximum creation date
     * @return {number} The current maximum creation date
     */
    getO2startFilterTo() {
        return this.o2startFilterTo;
    }

    /**
     * Returns the current minimum creation time
     * @return {number} The current minimum creation time
     */
    getO2startFilterFromTime() {
        return this.o2startFilterFromTime;
    }

    /**
     * Returns the current maximum creation time
     * @return {number} The current maximum creation time
     */
    getO2startFilterToTime() {
        return this.o2startFilterToTime;
    }

    /**
     * Set a datetime for the start datetime filter
     *
     * @param {string} comparisonType comparison type
     * @param {string} date The datetime to be applied to the datetime filter
     * @param {boolean} valid states whether provided date is valid
     * @return {void}
     */
    setO2startFilter(comparisonType, date, valid) {
        if (valid) {
            this[`o2startFilter${comparisonType}`] = date;
            this._applyFilters();
        }
    }

    /**
     * Returns the current minimum creation datetime
     * @return {number} The current minimum creation datetime
     */
    getO2endFilterFrom() {
        return this.o2endFilterFrom;
    }

    /**
     * Returns the current maximum creation datetime
     * @return {number} The current maximum creation datetime
     */
    getO2endFilterTo() {
        return this.o2endFilterTo;
    }

    /**
     * Returns the current minimum creation datetime
     * @return {number} The current minimum creation datetime
     */
    getO2endFilterFromTime() {
        return this.o2endFilterFromTime;
    }

    /**
     * Returns the current maximum creation datetime
     * @return {number} The current maximum creation datetime
     */
    getO2endFilterToTime() {
        return this.o2endFilterToTime;
    }

    /**
     * Set a datetime for the creation datetime filter
     * @param {string} key The filter value to apply the datetime to
     * @param {object} date The datetime to be applied to the creation datetime filter
     * @param {boolean} valid Whether the inserted date passes validity check
     * @return {undefined}
     */
    setO2endFilter(key, date, valid) {
        if (valid) {
            this[`o2endFilter${key}`] = date;
            this._applyFilters();
        }
    }

    /**
     * Returns the run duration filter (filter is defined in minutes)
     * @return {{operator: string, limit: (number|null)}|null} The current run duration filter
     */
    get runDurationFilter() {
        return this._runDurationFilter;
    }

    /**
     * Sets the limit of duration (in minutes) and the comparison operator to filter
     *
     * @param {{operator: string, limit: (number|null)}|null} newRunDurationFilter The new filter value
     *
     * @return {void}
     */
    set runDurationFilter(newRunDurationFilter) {
        this._runDurationFilter = newRunDurationFilter;
        this._applyFilters();
    }

    /**
     * Returns the current environment id(s) filter
     * @return {String} The current environment id(s) filter
     */
    getEnvFilter() {
        return this.environmentIdsFilter;
    }

    /**
     * Sets the environment id(s) filter if no new inputs were detected for 200 milliseconds
     * @param {string} newEnvironment The environment id(s) to apply to the filter
     * @return {undefined}
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
     * @return {Set} set of trigger filter values
     */
    get triggerValuesFilters() {
        return this._triggerValuesFilters;
    }

    /**
     * Setter for trigger values filter, this replaces the current set
     * @param {Array} newTriggerValues new Set of values
     * @return {undefined}
     */
    set triggerValuesFilters(newTriggerValues) {
        this._triggerValuesFilters = new Set(newTriggerValues);
        this._applyFilters();
    }

    /**
     * Returns the amount of detectors filters
     * @return {{operator: string, limit: (number|null)}|null} The current amount of detectors filters
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
     * @return {void}
     */
    setNDetectorsFilter(newNDetectors) {
        this.nDetectorsFilter = newNDetectors;
        this._applyFilters();
    }

    /**
     * Returns the current amount of epns filter
     * @return {{operator: string, limit: (number|null)}|null} The current amount of epns filters
     */
    get nEpnsFilter() {
        return this._nEpnsFilter;
    }

    /**
     * Returns the current amount of flps filter
     * @return {{operator: string, limit: (number|null)}|null} The current amount of flps filters
     */
    getNFlpsFilter() {
        return this.nFlpsFilter;
    }

    /**
     * Sets the limit of epns and the comparison operator to filter if no new inputs were detected for 200 milliseconds
     *
     * @param {{operator: string, limit: (number|null)}|null} newNEpns The new filter value
     *
     * @return {void}
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
     * @return {void}
     */
    setNFlpsFilter(newNFlps) {
        this.nFlpsFilter = newNFlps;
        this._applyFilters();
    }

    /**
     * Returns the boolean of ddflp
     * @return {Boolean} if ddflp is on
     */
    getDdflpFilterOperation() {
        return this.ddflpFilter;
    }

    /**
     * Sets the boolean of the filter if no new inputs were detected for 200 milliseconds
     * @param {boolean} operation if the ddflp is on
     * @return {undefined}
     */
    setDdflpFilterOperation(operation) {
        this.ddflpFilter = operation;
        this._applyFilters();
    }

    /**
     * Unchecks the ddflp checkbox and fetches all the runs.
     * @return {undefined}
     *
     */
    removeDdflp() {
        this.ddflpFilter = '';
        this._applyFilters();
    }

    /**
     * Returns the boolean of dcs
     * @return {Boolean} if dcs is on
     */
    getDcsFilterOperation() {
        return this.dcsFilter;
    }

    /**
     * Sets the boolean of the filter if no new inputs were detected for 200 milliseconds
     * @param {boolean} operation if the dcs is on
     * @return {undefined}
     */
    setDcsFilterOperation(operation) {
        this.dcsFilter = operation;
        this._applyFilters();
    }

    /**
     * Unchecks the dcs checkbox and fetches all the runs.
     * @return {undefined}
     */
    removeDcs() {
        this.dcsFilter = '';
        this._applyFilters();
    }

    /**
     * Returns the boolean of epn
     * @return {Boolean} if epn is on
     */
    getEpnFilterOperation() {
        return this.epnFilter;
    }

    /**
     * Sets the boolean of the filter if no new inputs were detected for 200 milliseconds
     * @param {boolean} operation if the epn is on
     * @return {undefined}
     */
    setEpnFilterOperation(operation) {
        this.epnFilter = operation;
        this._applyFilters();
    }

    /**
     * Unchecks the epn checkbox and fetches all the runs.
     * @return {undefined}
     */
    removeEpn() {
        this.epnFilter = '';
        this._applyFilters();
    }

    /**
     * Returns the current epnTopology substring filter
     * @return {String} The current epnTopology substring filter
     */
    get odcTopologyFullNameFilter() {
        return this._odcTopologyFullNameFilter;
    }

    /**
     * Sets the epnTopology substring filter if no new inputs were detected for 200 milliseconds
     * @param {string} newTopology The epnTopology substring to apply to the filter
     * @return {undefined}
     */
    set odcTopologyFullNameFilter(newTopology) {
        this._odcTopologyFullNameFilter = newTopology.trim();
        this._applyFilters();
    }

    /**
     * Gets the lhc period filter value
     * @return {string} lhc period filter value
     */
    get lhcPeriodsFilter() {
        return this._lhcPeriodsFilter;
    }

    /**
     * Sets the lhc period filter value
     * @param {string} value The lhc period value to filter on
     * @return {undefined}
     */
    set lhcPeriodsFilter(value) {
        this._lhcPeriodsFilter = value;
        this._applyFilters();
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
     * Returns the model handling the filtering on detectors
     *
     * @return {DetectorsFilterModel} the detectors filtering model
     */
    get detectorsFilterModel() {
        return this._detectorsFilterModel;
    }

    /**
     * Return all the runs currently filtered, without paging
     *
     * @return {RemoteData} the remote data of the runs
     */
    get allRuns() {
        if (this._allRuns.isNotAsked()) {
            this._fetchAllRunsWithoutPagination();
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
        return allRuns.payload.length < this._pagination.itemsCount;
    }

    /**
     * Return the model handling the filtering on run types
     *
     * @return {RunTypesSelectionDropdownModel} the run type filtering model
     */
    get listingRunTypesFilterModel() {
        return this._listingRunTypesFilterModel;
    }

    /**
     * Return the model handling the filtering on run types
     *
     * @return {EorReasonsFilterModel} the run type filtering model
     */
    get eorReasonsFilterModel() {
        return this._eorReasonsFilterModel;
    }

    /**
     * Set the model handling the filtering on run types
     * @param {EorReasonFilterModel} model the model to set
     * @return {void}
     */
    set eorReasonsFilterModel(model) {
        this._eorReasonsFilterModel = model;
    }

    /**
     * Get Alice L3 Current filter model
     * @return {SelectionDropdownModel} filter model
     */
    get aliceL3AndDipoleCurrentFilter() {
        return this._aliceL3AndDipoleCurrentFilter;
    }

    /**
     * Set of cached pdp_beam_types of fetched runs
     *
     * @return {Set<string>} cached beam types
     */
    get cachedPdpBeamTypes() {
        return this._cachedPdpBeamTypes;
    }

    /**
     * Get muInelasticInteractionRate filter model
     *
     * @return {FloatComparisonFilterModel} filter model
     */
    get muInelasticInteractionRateFilterModel() {
        return this._muInelasticInteractionRateFilterModel;
    }

    /**
     * Get inelasticInteractionRateAvg filter model
     *
     * @return {FloatComparisonFilterModel} filter model
     */
    get inelasticInteractionRateAvgFilterModel() {
        return this._inelasticInteractionRateAvgFilterModel;
    }

    /**
     * Get inelasticInteractionRateAtStart filter model
     *
     * @return {FloatComparisonFilterModel} filter model
     */
    get inelasticInteractionRateAtStartFilterModel() {
        return this._inelasticInteractionRateAtStartFilterModel;
    }

    /**
     * Get inelasticInteractionRateAtMid filter model
     *
     * @return {FloatComparisonFilterModel} filter model
     */
    get inelasticInteractionRateAtMidFilterModel() {
        return this._inelasticInteractionRateAtMidFilterModel;
    }

    /**
     * Get inelasticInteractionRateAtEnd filter model
     *
     * @return {FloatComparisonFilterModel} filter model
     */
    get inelasticInteractionRateAtEndFilterModel() {
        return this._inelasticInteractionRateAtEndFilterModel;
    }

    /**
     * Returns the list of URL params corresponding to the currently applied filter
     *
     * @return {Object} the URL params
     *
     * @private
     */
    _getFilterQueryParams() {
        const inelFilterModels = {
            muInelasticInteractionRate: this._muInelasticInteractionRateFilterModel,
            inelasticInteractionRateAvg: this._inelasticInteractionRateAvgFilterModel,
            inelasticInteractionRateAtStart: this._inelasticInteractionRateAtStartFilterModel,
            inelasticInteractionRateAtMid: this._inelasticInteractionRateAtMidFilterModel,
            inelasticInteractionRateAtEnd: this._inelasticInteractionRateAtEndFilterModel,
        };

        return {
            ...this.runFilterValues && {
                'filter[runNumbers]': this.runFilterValues,
            },
            ...!this._eorReasonsFilterModel.isEmpty() && this._eorReasonsFilterModel.getFilterQueryParams(),
            ...!this._detectorsFilterModel.isEmpty() && {
                'filter[detectors][operator]': this._detectorsFilterModel.combinationOperator,
                ...!this._detectorsFilterModel.isNone() && { 'filter[detectors][values]': this._detectorsFilterModel.selected.join() },
            },
            ...this._runDefinitionFilter.length > 0 && {
                'filter[definitions]': this._runDefinitionFilter.join(','),
            },
            ...!this._listingTagsFilterModel.isEmpty() && {
                'filter[tags][values]': this._listingTagsFilterModel.selected.join(),
                'filter[tags][operation]': this._listingTagsFilterModel.combinationOperator,
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
            ...this._listingRunTypesFilterModel.selected.length > 0 && {
                'filter[runTypes]': this._listingRunTypesFilterModel.selected,
            },

            ...this._aliceL3AndDipoleCurrentFilter.selected.length > 0 && {
                'filter[aliceL3Current]': this._aliceL3AndDipoleCurrentFilter.selectedOptions[0].filteringParams.aliceL3Current,
                'filter[aliceDipoleCurrent]': this._aliceL3AndDipoleCurrentFilter.selectedOptions[0].filteringParams.aliceDipoleCurrent,
            },
            ...Object.fromEntries(Object.entries(inelFilterModels)
                .filter(([_, filterModel]) => !filterModel.isEmpty)
                .map(([property, filterModel]) => [
                    `filter[${property}][${filterModel.current.operator}]`,
                    filterModel.current.value,
                ])),
        };
    }

    /**
     * Update the cache containing all the runs without paging
     *
     * @return {Promise<void>} void
     * @private
     */
    async _fetchAllRunsWithoutPagination() {
        if (this.items.isSuccess() && this.items.payload.length === this._pagination.itemsCount) {
            this._allRuns = RemoteData.success([...this.items.payload]);
            this.notify();
            return;
        }
        this._allRuns = RemoteData.loading();
        this.notify();

        const endpoint = this.getRootEndpoint();

        try {
            const { items } = await getRemoteDataSlice(endpoint);
            this._allRuns = RemoteData.success(items);
        } catch (errors) {
            this._allRuns = RemoteData.failure(errors);
        }

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
        now ? this.load() : this._debouncedLoad(true);
    }
}
