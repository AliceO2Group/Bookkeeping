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
        this._detectors$ = detectorsProvider.physical$;
        this._detectors$.bubbleTo(this);

        this._syncDetectors$ = ObservableData
            .builder()
            .source(detectorsProvider.qc$)
            .apply((remoteDetectors) =>
                remoteDetectors.apply({
                    Success: (detectors) => detectors.filter(({ type }) => [DetectorType.PHYSICAL, DetectorType.MUON_GLO].includes(type)),
                }))
            .build();

        this._syncDetectors$.bubbleTo(this);

        this._tabbedPanelModel = new RunsPerLhcPeriodTabbedPanelModel();
        this._tabbedPanelModel.bubbleTo(this);
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        return buildUrl(super.getRootEndpoint(), {
            filter: {
                lhcPeriods: this._lhcPeriodName,
                runQualities: 'good',
                definitions: 'PHYSICS',
            },
        });
    }

    /**
     * Get name of current lhc period which runs are fetched
     */
    get lhcPeriodName() {
        return this._lhcPeriodName;
    }

    /**
     * Set name of current lhc period which runs are fetched
     *
     * @param {string} lhcPeriodName name of LHC period
     */
    set lhcPeriodName(lhcPeriodName) {
        this._lhcPeriodName = lhcPeriodName;
        this._tabbedPanelModel.lhcPeriodName = lhcPeriodName;
    }

    /**
     * Get all detectors
     *
     * @return {RemoteData<Detector[]>} detectors
     */
    get detectors() {
        return this._detectors$.getCurrent();
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
     * Returns the model for the tabbed component
     *
     * @return {RunsPerLhcPeriodTabbedPanelModel} the tabbed component model
     */
    get tabbedPanelModel() {
        return this._tabbedPanelModel;
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

    /**
     * @inheritDoc
     */
    _fetchCurrentPanelData() {
        switch (this.currentPanelKey) {
            case RUNS_PER_LHC_PERIOD_PANELS_KEYS.DETECTOR_QUALITIES:
                this.currentPanelData = null;
                break;
            case RUNS_PER_LHC_PERIOD_PANELS_KEYS.SYNCHRONOUS_FLAGS:
                this._fetchSynchronousQcSummary();
                break;
        }
    }

    /**
     * Fetch QC summary for synchronous QC flags
     *
     * @return {Promise<void>} resolved once data are fetched
     */
    async _fetchSynchronousQcSummary() {
        if (this._lhcPeriodName) {
            this.currentPanelData = RemoteData.loading();
            this.notify();
            try {
                const { data: [lhcPeriod] } = await jsonFetch(`/api/lhcPeriodsStatistics?filter[names][]=${this._lhcPeriodName}`);
                if (!lhcPeriod) {
                    this.currentPanelData = RemoteData.failure([{ title: `Cannot find LHC period with name '${this._lhcPeriodName}'` }]);
                } else {
                    const { data: qcSummary } = await jsonFetch(`/api/qcFlags/summary?lhcPeriodId=${lhcPeriod.id}`);
                    this.currentPanelData = RemoteData.success(qcSummary);
                }
            } catch (errors) {
                this.currentPanelData = RemoteData.failure(errors);
            }
            this.notify();
        }
    }

    /**
     * Set LHC period name
     *
     * @param {string} lhcPeriodName name of LHC period
     */
    set lhcPeriodName(lhcPeriodName) {
        this._lhcPeriodName = lhcPeriodName;
        this._fetchCurrentPanelData();
    }
}
