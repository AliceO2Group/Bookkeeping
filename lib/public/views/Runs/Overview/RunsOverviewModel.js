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
import { RunTypesFilterModel } from '../../../components/runTypes/RunTypesFilterModel.js';
import { EorReasonFilterModel } from '../../../components/Filters/RunsFilter/EorReasonFilterModel.js';
import pick from '../../../utilities/pick.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';
import { CombinationOperator } from '../../../components/Filters/common/CombinationOperatorChoiceModel.js';
import { NumericalComparisonFilterModel } from '../../../components/Filters/common/filters/NumericalComparisonFilterModel.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';
import { MagnetsFilteringModel } from '../../../components/Filters/RunsFilter/MagnetsFilteringModel.js';
import { FilteringModel } from '../../../components/Filters/common/FilteringModel.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { tagsProvider } from '../../../services/tag/tagsProvider.js';
import { eorReasonTypeProvider } from '../../../services/eorReason/eorReasonTypeProvider.js';
import { runTypesProvider } from '../../../services/runTypes/runTypesProvider.js';
import { TimeRangeFilterModel } from '../../../components/Filters/RunsFilter/TimeRangeFilter.js';
import { magnetsCurrentLevelsProvider } from '../../../services/magnets/magnetsCurrentLevelsProvider.js';
import { RawTextFilterModel } from '../../../components/Filters/common/filters/RawTextFilterModel.js';
import { RunDefinitionFilterModel } from '../../../components/Filters/RunsFilter/RunDefinitionFilterModel.js';
import { RUN_QUALITIES } from '../../../domain/enums/RunQualities.js';
import { SelectionFilterModel } from '../../../components/Filters/common/filters/SelectionFilterModel.js';
import { BooleanFilterModel } from '../../../components/Filters/common/filters/BooleanFilterModel.js';
import { TRIGGER_VALUES } from '../../../domain/enums/TriggerValue.js';

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

        this._filteringModel = new FilteringModel(this._getFilteringConfiguration());

        this._filteringModel.observe(() => this._applyFilters(true));
        this._filteringModel.visualChange$.bubbleTo(this);

        // Export items
        this._allRuns = RemoteData.NotAsked();

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
        return buildUrl('/api/runs', { filter: this.filteringModel.normalized });
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load() {
        this._allRuns = RemoteData.NotAsked();
        super.load();
    }

    /**
     * Create the export with the variables set in the model, handling errors appropriately
     * @param {object[]} runs The source content.
     * @param {string} fileName The name of the file including the output format.
     * @param {Object<string, Function<*, string>>} exportFormats defines how particular fields of data units will be formated
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
     * @param {boolean} [fetch = true] whether to refetch all data after filters have been reset
     * @return {void}
     */
    reset(fetch = true) {
        super.reset();
        this.resetFiltering(fetch);
    }

    /**
     * Reset all filtering models
     * @param {boolean} fetch Whether to refetch all data after filters have been reset
     * @return {void}
     */
    resetFiltering(fetch = true) {
        this._filteringModel.reset();

        if (fetch) {
            this._applyFilters(true);
        }
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @return {Boolean} If any filter is active
     */
    isAnyFilterActive() {
        return this._filteringModel.isAnyFilterActive();
    }

    /**
     * Return the filtering model
     *
     * @return {FilteringModel} the filtering model
     */
    get filteringModel() {
        return this._filteringModel;
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
     * Return the list of filtering models to be used by filtering model of the runs overview
     *
     * @return {Object<string, FilterModel>} the list of filtering models
     * @private
     */
    _getFilteringConfiguration() {
        return {
            runNumbers: new RawTextFilterModel(),
            detectors: new DetectorsFilterModel(detectorsProvider.dataTaking$),
            tags: new TagFilterModel(
                tagsProvider.items$,
                [
                    CombinationOperator.AND,
                    CombinationOperator.OR,
                    CombinationOperator.NONE_OF,
                ],
            ),
            fillNumbers: new RawTextFilterModel(),
            lhcPeriods: new RawTextFilterModel(),
            o2start: new TimeRangeFilterModel(),
            o2end: new TimeRangeFilterModel(),
            definitions: new RunDefinitionFilterModel(),
            runDuration: new NumericalComparisonFilterModel({ scale: 60 * 1000 }),
            environmentIds: new RawTextFilterModel(),
            runTypes: new RunTypesFilterModel(runTypesProvider.items$),
            runQualities: new SelectionFilterModel({
                availableOptions: RUN_QUALITIES.map((quality) => ({
                    label: quality.toUpperCase(),
                    value: quality,
                })),
            }),
            nDetectors: new NumericalComparisonFilterModel({ integer: true }),
            nEpns: new NumericalComparisonFilterModel({ integer: true }),
            nFlps: new NumericalComparisonFilterModel({ integer: true }),
            ddflp: new BooleanFilterModel(),
            dcs: new BooleanFilterModel(),
            triggerValues: new SelectionFilterModel({ availableOptions: TRIGGER_VALUES.map((value) => ({ value })) }),
            epn: new BooleanFilterModel(),
            odcTopologyFullName: new RawTextFilterModel(),
            eorReason: new EorReasonFilterModel(eorReasonTypeProvider.items$),
            magnets: new MagnetsFilteringModel(magnetsCurrentLevelsProvider.items$),
            muInelasticInteractionRate: new NumericalComparisonFilterModel({ useOperatorAsNormalizationKey: true }),
            inelasticInteractionRateAvg: new NumericalComparisonFilterModel({ useOperatorAsNormalizationKey: true }),
            inelasticInteractionRateAtStart: new NumericalComparisonFilterModel({ useOperatorAsNormalizationKey: true }),
            inelasticInteractionRateAtMid: new NumericalComparisonFilterModel({ useOperatorAsNormalizationKey: true }),
            inelasticInteractionRateAtEnd: new NumericalComparisonFilterModel({ useOperatorAsNormalizationKey: true }),
        };
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
