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

        this._lhcPeriodId = null;
        this._lhcPeriod$ = new ObservableData(RemoteData.notAsked());
        this._lhcPeriod$.bubbleTo(this);

        this._tabbedPanelModel = new RunsPerLhcPeriodTabbedPanelModel();
        this._tabbedPanelModel.bubbleTo(this);
    }

    /**
     * Fetch LHC period data which runs are fetched
     * @return {Promise<void>} promise
     */
    async _fetchLhcPeriod() {
        this._lhcPeriod$.setCurrent(RemoteData.loading());
        try {
            const { data: [lhcPeriod] } = await jsonFetch(`/api/lhcPeriodsStatistics?filter[ids][]=${this._lhcPeriodId}`);
            this._lhcPeriod$.setCurrent(RemoteData.success(lhcPeriod));
        } catch (error) {
            this._lhcPeriod$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * @inheritdoc
     */
    async load() {
        if (!this._lhcPeriodId) {
            return;
        }

        await this._fetchLhcPeriod();
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
    get lhcPeriod() {
        return this._lhcPeriod$.getCurrent();
    }

    /**
     * Set id of current LHC period which runs are fetched
     *
     * @param {string} lhcPeriodId id of a LHC period
     */
    set lhcPeriodId(lhcPeriodId) {
        this._lhcPeriodId = lhcPeriodId;
        this._tabbedPanelModel.lhcPeriodId = lhcPeriodId;
    }

    /**
     * Set mcReproducibleAsNotBad flag
     *
     * @param {boolean} mcReproducibleAsNotBad new value
     */
    setMcReproducibleAsNotBad(mcReproducibleAsNotBad) {
        super.setMcReproducibleAsNotBad(mcReproducibleAsNotBad);
        this._tabbedPanelModel.mcReproducibleAsNotBad = mcReproducibleAsNotBad;
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
        if (this._lhcPeriodId) {
            this.currentPanelData = RemoteData.loading();
            this.notify();
            try {
                const { data: qcSummary } = await jsonFetch(buildUrl(
                    '/api/qcFlags/summary',
                    {
                        lhcPeriodId: this._lhcPeriodId,
                        mcReproducibleAsNotBad: this._mcReproducibleAsNotBad,
                    },
                ));
                this.currentPanelData = RemoteData.success(qcSummary);
            } catch (errors) {
                this.currentPanelData = RemoteData.failure(errors);
            }
            this.notify();
        }
    }

    /**
     * Set LHC period id
     *
     * @param {id} lhcPeriodId id of LHC period
     */
    set lhcPeriodId(lhcPeriodId) {
        this._lhcPeriodId = lhcPeriodId;
        this._fetchCurrentPanelData();
    }

    /**
     * Set mcReproducibleAsNotBad flag
     *
     * @param {boolean} mcReproducibleAsNotBad new value
     */
    set mcReproducibleAsNotBad(mcReproducibleAsNotBad) {
        this._mcReproducibleAsNotBad = mcReproducibleAsNotBad;
        this._fetchCurrentPanelData();
    }
}
