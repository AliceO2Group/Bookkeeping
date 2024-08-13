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
import { TabbedPanelModel } from '../../../components/TabbedPanel/TabbedPanelModel.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { RunsOverviewModel } from '../Overview/RunsOverviewModel.js';
import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';

export const RUNS_PER_LHC_PERIOD_PANELS_KEYS = {
    DETECTOR_QUALITIES: 'detectorQualities',
    SYNCHRONOUS_FLAGS: 'synchronousFlags',
};

/**
 * Runs Per LHC Period overview model
 */
export class RunsPerLhcPeriodOverviewModel extends RunsOverviewModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);
        this._detectors$ = detectorsProvider.physical$;
        this._detectors$.bubbleTo(this);

        this.patchDisplayOptions({ horizontalScrollEnabled: true });

        this._tabbedPanelModel = new RunsPerLhcPeriodTabbedPanelModel();
        this._tabbedPanelModel.bubbleTo(this);
    }

    // eslint-disable-next-line valid-jsdoc
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
     * @param {string} lhcPeriodName name of LHC period
     */
    set lhcPeriodName(lhcPeriodName) {
        this._lhcPeriodName = lhcPeriodName;
        this._tabbedPanelModel.lhcPeriodName = lhcPeriodName;
    }

    /**
     * Get all detectors
     * @return {RemoteData<Detector[]>} detectors
     */
    get detectors() {
        return this._detectors$.getCurrent();
    }

    /**
     * Returns the model for the tabbed component at the bottom of the page
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

        this.currentPanelData = RemoteData.notAsked();
    }

    // eslint-disable-next-line valid-jsdoc
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
                const { data: qcSummary } = await jsonFetch(`/api/qcFlags/summary?lhcPeriodId=${lhcPeriod.id}`);
                this.currentPanelData = RemoteData.success(qcSummary);
            } catch (errors) {
                this.currentPanelData = RemoteData.failure(errors);
            }
            this.notify();
        }
    }

    /**
     * Set LHC period name
     * @param {string} lhcPeriodName name of LHC period
     */
    set lhcPeriodName(lhcPeriodName) {
        this._lhcPeriodName = lhcPeriodName;
        this._fetchCurrentPanelData();
    }
}
