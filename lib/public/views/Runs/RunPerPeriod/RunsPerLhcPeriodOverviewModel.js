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
import { buildUrl, RemoteData } from '/js/src/index.js';
import { TabbedPanelModel } from '../../../components/TabbedPanel/TabbedPanelModel.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';
import { RunsWithQcModel } from '../Overview/RunsWithQcModel.js';
import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';
import { DetectorType } from '../../../domain/enums/DetectorTypes.js';
import { ObservableData } from '../../../utilities/ObservableData.js';

export const RUNS_PER_LHC_PERIOD_PANELS_KEYS = {
    DETECTOR_QUALITIES: 'detectorQualities',
    SYNCHRONOUS_FLAGS: 'synchronousFlags',
};

/**
 * Runs Per LHC Period overview model
 */
export class RunsPerLhcPeriodOverviewModel extends RunsWithQcModel {
    /**
     * Constructor
     *
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);

        this._lhcPeriodId = null;
        this._lhcPeriodStatistics$ = new ObservableData(RemoteData.notAsked());

        this._onlineDetectors$ = detectorsProvider.physical$;

        this._syncDetectors$ = ObservableData
            .builder()
            .source(detectorsProvider.qc$)
            .apply((remoteDetectors) =>
                remoteDetectors.apply({
                    Success: (detectors) => detectors.filter(({ type }) => [DetectorType.PHYSICAL, DetectorType.MUON_GLO].includes(type)),
                }))
            .build();

        this.registerObervablesQcSummaryDependesOn([this._syncDetectors$]);

        this._syncDetectors$.bubbleTo(this);
        this._onlineDetectors$.bubbleTo(this);
        this._lhcPeriodStatistics$.bubbleTo(this);

        this._tabbedPanelModel = new RunsPerLhcPeriodTabbedPanelModel(this._qcSummary$);
        this._tabbedPanelModel.bubbleTo(this);
    }

    /**
     * Fetch LHC period data which runs are fetched
     * @return {Promise<void>} promise
     */
    async _fetchLhcPeriod() {
        this._lhcPeriodStatistics$.setCurrent(RemoteData.loading());
        try {
            const { data: [lhcPeriodStatistics] } = await jsonFetch(`/api/lhcPeriodsStatistics?filter[ids][]=${this._lhcPeriodId}`);
            this._lhcPeriodStatistics$.setCurrent(RemoteData.success(lhcPeriodStatistics));
        } catch (error) {
            this._lhcPeriodStatistics$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * @inheritdoc
     */
    async load() {
        if (!this._lhcPeriodId) {
            return;
        }

        this._fetchLhcPeriod();
        super.load();
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        return buildUrl(super.getRootEndpoint(), {
            filter: {
                lhcPeriodIds: [this._lhcPeriodId],
                runQualities: 'good',
                definitions: 'PHYSICS',
            },
        });
    }

    /**
     * Get LHC period which runs are fetched
     */
    get lhcPeriodStatistics() {
        return this._lhcPeriodStatistics$.getCurrent();
    }

    /**
     * Get all detectors
     *
     * @return {RemoteData<Detector[]>} detectors
     */
    get onlineDetectors() {
        return this._onlineDetectors$.getCurrent();
    }

    /**
     * Get all detectors for synchronous QC flags
     *
     * @return {RemoteData<Detector[]>} detectors
     */
    get syncDetectors() {
        return this._syncDetectors$.getCurrent();
    }

    /**
     * @inheritdoc
     */
    get detectors() {
        return this._syncDetectors$.getCurrent();
    }

    /**
     * Returns the model for the tabbed component
     *
     * @return {RunsPerLhcPeriodTabbedPanelModel} the tabbed component model
     */
    get tabbedPanelModel() {
        return this._tabbedPanelModel;
    }

    /**
     * Set id of current LHC period which runs are fetched
     *
     * @param {string} lhcPeriodId id of a LHC period
     */
    set lhcPeriodId(lhcPeriodId) {
        this._lhcPeriodId = lhcPeriodId;
    }

    /**
     * @inheritdoc
     */
    get qcSummaryScope() {
        return { lhcPeriodId: this._lhcPeriodId };
    }
}

/**
 * RunsPerLhcPeriodTabbedPanelModel
 */
class RunsPerLhcPeriodTabbedPanelModel extends TabbedPanelModel {
    /**
     * Constructor
     */
    constructor() {
        super(Object.values(RUNS_PER_LHC_PERIOD_PANELS_KEYS));
    }
}
