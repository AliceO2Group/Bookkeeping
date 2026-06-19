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

import { TagFilterModel } from '../../../components/Filters/common/TagFilterModel.js';
import { debounce } from '../../../utilities/debounce.js';
import { DetectorsFilterModel } from '../../../components/Filters/RunsFilter/DetectorsFilterModel.js';
import { RunTypesFilterModel } from '../../../components/runTypes/RunTypesFilterModel.js';
import { EorReasonFilterModel } from '../../../components/Filters/RunsFilter/EorReasonFilterModel.js';
import { FilterableOverviewPageModel } from '../../../models/FilterableOverviewPageModel.js';
import { CombinationOperator } from '../../../components/Filters/common/CombinationOperatorChoiceModel.js';
import { NumericalComparisonFilterModel } from '../../../components/Filters/common/filters/NumericalComparisonFilterModel.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';
import { MagnetsFilteringModel } from '../../../components/Filters/RunsFilter/MagnetsFilteringModel.js';
import { tagsProvider } from '../../../services/tag/tagsProvider.js';
import { eorReasonTypeProvider } from '../../../services/eorReason/eorReasonTypeProvider.js';
import { runTypesProvider } from '../../../services/runTypes/runTypesProvider.js';
import { TimeRangeFilterModel } from '../../../components/Filters/RunsFilter/TimeRangeFilter.js';
import { magnetsCurrentLevelsProvider } from '../../../services/magnets/magnetsCurrentLevelsProvider.js';
import { RawTextFilterModel } from '../../../components/Filters/common/filters/RawTextFilterModel.js';
import { RunDefinitionFilterModel } from '../../../components/Filters/RunsFilter/RunDefinitionFilterModel.js';
import { RUN_QUALITIES } from '../../../domain/enums/RunQualities.js';
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
export class RunsOverviewModel extends FilterableOverviewPageModel {
    /**
     * The constructor of the Overview model object
     * @param {Model} model global model
     * @param {string} pageIdentifier string that indicates what page this model represents
     */
    constructor(model, pageIdentifier) {
        super(
            model.router,
            pageIdentifier,
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
                runQualities: new SelectionModel({
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
            },
        );

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
    getRootEndpoint() {
        return this.buildRootEndpoint('/api/runs');
    }
}
