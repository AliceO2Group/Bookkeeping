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

import { buildUrl } from '/js/src/index.js';
import { TagFilterModel } from '../../../components/Filters/common/TagFilterModel.js';
import { debounce } from '../../../utilities/debounce.js';
import { DetectorsFilterModel } from '../../../components/Filters/RunsFilter/DetectorsFilterModel.js';
import { RunTypesFilterModel } from '../../../components/runTypes/RunTypesFilterModel.js';
import { EorReasonFilterModel } from '../../../components/Filters/RunsFilter/EorReasonFilterModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { CombinationOperator } from '../../../components/Filters/common/CombinationOperatorChoiceModel.js';
import { NumericalComparisonFilterModel } from '../../../components/Filters/common/filters/NumericalComparisonFilterModel.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';
import { MagnetsFilteringModel } from '../../../components/Filters/RunsFilter/MagnetsFilteringModel.js';
import { FilteringModel } from '../../../components/Filters/common/FilteringModel.js';
import { tagsProvider } from '../../../services/tag/tagsProvider.js';
import { eorReasonTypeProvider } from '../../../services/eorReason/eorReasonTypeProvider.js';
import { runTypesProvider } from '../../../services/runTypes/runTypesProvider.js';
import { TimeRangeFilterModel } from '../../../components/Filters/RunsFilter/TimeRangeFilter.js';
import { magnetsCurrentLevelsProvider } from '../../../services/magnets/magnetsCurrentLevelsProvider.js';
import { RawTextFilterModel } from '../../../components/Filters/common/filters/RawTextFilterModel.js';
import { RunDefinitionFilterModel } from '../../../components/Filters/RunsFilter/RunDefinitionFilterModel.js';
import { RUN_QUALITIES } from '../../../domain/enums/RunQualities.js';
import { SelectionFilterModel } from '../../../components/Filters/common/filters/SelectionFilterModel.js';
import { DataExportModel } from '../../../models/DataExportModel.js';
import { runsActiveColumns as dataExportConfiguration } from '../ActiveColumns/runsActiveColumns.js';
import { BeamModeFilterModel } from '../../../components/Filters/RunsFilter/BeamModeFilterModel.js';
import { beamModesProvider } from '../../../services/beamModes/beamModesProvider.js';
import { RadioButtonFilterModel } from '../../../components/Filters/common/RadioButtonFilterModel.js';
import { SelectionModel } from '../../../components/common/selection/SelectionModel.js';
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

        this._filteringModel = new FilteringModel(
            model.router,
            {
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
            beamModes: new BeamModeFilterModel(beamModesProvider.items$),
            runQualities: new SelectionFilterModel({
                availableOptions: RUN_QUALITIES.map((quality) => ({
                    label: quality.toUpperCase(),
                    value: quality,
                })),
            }),
            nDetectors: new NumericalComparisonFilterModel({ integer: true }),
            nEpns: new NumericalComparisonFilterModel({ integer: true }),
            nFlps: new NumericalComparisonFilterModel({ integer: true }),
            ctfFileCount: new NumericalComparisonFilterModel({ integer: true }),
            tfFileCount: new NumericalComparisonFilterModel({ integer: true }),
            otherFileCount: new NumericalComparisonFilterModel({ integer: true }),
            odcTopologyFullName: new RawTextFilterModel(),
            eorReason: new EorReasonFilterModel(eorReasonTypeProvider.items$),
            magnets: new MagnetsFilteringModel(magnetsCurrentLevelsProvider.items$),
            muInelasticInteractionRate: new NumericalComparisonFilterModel(),
            inelasticInteractionRateAvg: new NumericalComparisonFilterModel(),
            inelasticInteractionRateAtStart: new NumericalComparisonFilterModel(),
            inelasticInteractionRateAtMid: new NumericalComparisonFilterModel(),
            inelasticInteractionRateAtEnd: new NumericalComparisonFilterModel(),
            ddflp: new RadioButtonFilterModel([{ label: 'ANY' }, { label: 'ON', value: true }, { label: 'OFF', value: false }]),
            dcs: new RadioButtonFilterModel([{ label: 'ANY' }, { label: 'ON', value: true }, { label: 'OFF', value: false }]),
            epn: new RadioButtonFilterModel([{ label: 'ANY' }, { label: 'ON', value: true }, { label: 'OFF', value: false }]),
            triggerValues: new SelectionModel({ availableOptions: TRIGGER_VALUES.map((value) => ({ label: value, value })) }),
        });

        this._filteringModel.pageIdentifiers = ['run-overview'];
        this._filteringModel.observe(() => this._applyFilters(true));
        this._filteringModel.visualChange$.bubbleTo(this);

        this.reset(false);
        const updateDebounceTime = () => {
            this._debouncedLoad = debounce(this.load.bind(this), model.inputDebounceTime);
        };

        this._exportModel = new DataExportModel(this._allItems$, dataExportConfiguration, () => this.loadAll());
        this._exportModel.bubbleTo(this);
        this._item$.observe(() => {
            this._exportModel.setDisabled(!this.hasAnyData());
            this._exportModel.setTotalExistingItemsCount(this._pagination.itemsCount);
        });

        model.appConfiguration$.observe(() => updateDebounceTime());
        updateDebounceTime();
        this._filteringModel.setFilterFromURL();
    }

    /**
     * Get export model
     * @return {DataExportModel} export model
     */
    get exportModel() {
        return this._exportModel;
    }

    /**
     * @inheritdoc
     */
    get filterQuery() {
        return { filter: this.filteringModel.normalized };
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint(filterQuery = this.filterQuery) {
        return buildUrl('/api/runs', filterQuery);
    }

    /**
     * Returns all filtering, sorting and pagination settings to their default values
     * @param {boolean} [fetch = true] whether to refetch all data after filters have been reset
     * @return {void}
     */
    reset(fetch = true) {
        super.reset();
        this._exportModel?.reset();
        this.resetFiltering(fetch);
    }

    /**
     * Reset all filtering models
     * @param {boolean} resetUrl Whether to remove all the active filters from the urls
     * @return {void}
     */
    resetFiltering(fetch = true, resetUrl=false) {
        this._filteringModel.reset(false, resetUrl);

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
