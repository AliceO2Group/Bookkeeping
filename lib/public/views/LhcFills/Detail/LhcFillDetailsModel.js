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
import { Observable, RemoteData } from '/js/src/index.js';
import { addStatisticsToLhcFill } from '../../../services/lhcFill/addStatisticsToLhcFill.js';
import { LhcFillStatisticsExtractor } from '../../../services/lhcFill/LhcFillStatisticsExtractor.js';
import { RunsCounter } from '../../../services/run/RunsCounter.js';
import { TimeBetweenRunsTracker } from '../../../services/run/TimeBetweenRunsTracker.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { TabbedPanelModel } from '../../../components/TabbedPanel/TabbedPanelModel.js';

export const LHC_FILL_DETAILS_PANELS_KEYS = {
    RUNS: 'runs',
};

/**
 * Model for LHC fills details page
 */
export class LhcFillDetailsModel extends Observable {
    /**
     * Constructor
     *
     * @param {number|null} lhcFillNumber the ID ot the LHC fill this model represents
     */
    constructor(lhcFillNumber = null) {
        super();
        this.lhcFillNumber = lhcFillNumber;

        this._tabbedPanelModel = new LhcFillDetailsTabbedPanelModel();
        this._tabbedPanelModel.bubbleTo(this);
    }

    /**
     * Return the LHC fill represented by this model
     *
     * @return {RemoteData} the current lhc fill details, including lhcFill and runs count
     */
    get lhcFillDetails() {
        return this._lhcFill;
    }

    /**
     * Define the ID of the LHC fill handled by the current model and update data accordingly
     *
     * @param {number|null} lhcFillNumber the new fill ID
     *
     * @return {void}
     */
    set lhcFillNumber(lhcFillNumber) {
        if (lhcFillNumber === null) {
            this._lhcFill = RemoteData.notAsked();
        } else {
            if (this._lhcFill.isSuccess() && this._lhcFill.payload.fillNumber === lhcFillNumber) {
                return;
            }
            this._fetchLhcFill(lhcFillNumber);
        }
    }

    /**
     * Retrieve a specified LHC fill from the API
     *
     * @param {number} lhcFillNumber The number of the fill to be found
     * @returns {void} Injects the data object with the response data
     */
    async _fetchLhcFill(lhcFillNumber) {
        this._lhcFill = RemoteData.loading();
        this.notify();

        try {
            const { data: lhcFill } = await getRemoteData(`/api/lhcFills/${lhcFillNumber}`);
            this._tabbedPanelModel.lhcFill = lhcFill;

            this._lhcFill = RemoteData.success(lhcFill);
        } catch (error) {
            this._lhcFill = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Returns the model for the tabbed component at the bottom of the page
     * @return {LhcFillDetailsTabbedPanelModel} the tabbed component model
     */
    get tabbedPanelModel() {
        return this._tabbedPanelModel;
    }
}

/**
 * Submodel for LHC fill details tabs
 */
class LhcFillDetailsTabbedPanelModel extends TabbedPanelModel {
    /**
     * Constructor
     */
    constructor() {
        super(Object.values(LHC_FILL_DETAILS_PANELS_KEYS));
        this._runsTabModel = new LhcFillDetailsRunsTabModel();
        this._runsTabModel.observe(() => {
            if (this.currentPanelKey === LHC_FILL_DETAILS_PANELS_KEYS.RUNS) {
                this.currentPanelData = this._runsTabModel.panelData;
            }
        });
        this._runsTabModel.bubbleTo(this);
    }

    /**
     * Set the current LHC fill
     * @param {LhcFill} lhcFill the current LHC fill
     */
    set lhcFill(lhcFill) {
        this._runsTabModel.lhcFill = lhcFill;
    }

    /**
     * Return the current run tab model
     * @return {LhcFillDetailsRunsTabModel} the run tab model
     */
    get runsTabModel() {
        return this._runsTabModel;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _fetchCurrentPanelData() {
        switch (this.currentPanelKey) {
            case LHC_FILL_DETAILS_PANELS_KEYS.RUNS:
                this.currentPanelData = this._runsTabModel.panelData;
                break;
        }
    }
}

/**
 * Sub-model for runs tab of the LHC fill details page
 */
class LhcFillDetailsRunsTabModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._limitRunsToPhysics = true;

        /**
         * @type {({allRuns: Run[], runs: Run[], runsCounter: RunsCounter}|null)}
         * @private
         */
        this._panelData = null;
        this._lhcFill = null;
    }

    /**
     * Set the current LHC fill
     * @param {LhcFill} lhcFill the current LHC fill
     */
    set lhcFill(lhcFill) {
        this._lhcFill = lhcFill;

        const runs = this._limitRunsToPhysics ? lhcFill.runs.filter(({ definition }) => definition === 'PHYSICS') : lhcFill.runs;
        const { runsCounter } = this._updateLhcFillStatistics(lhcFill, runs);

        this._panelData = {
            allRuns: [...lhcFill.runs],
            runs,
            runsCounter,
        };
        this.notify();
    }

    /**
     * Returns the current panel data
     * @return {RemoteData} the current panel data
     */
    get panelData() {
        return this._panelData;
    }

    /**
     * States if runs must be restricted to physics
     *
     * @return {boolean} true if runs must be restricted to physics
     */
    get limitRunsToPhysics() {
        return this._limitRunsToPhysics;
    }

    /**
     * Defines if runs must be restricted to physics
     *
     * @param {boolean} value true to restrict runs to physics
     */
    set limitRunsToPhysics(value) {
        this._limitRunsToPhysics = value;
        if (this._lhcFill && this._panelData) {
            const { allRuns } = this._panelData;

            if (value) {
                this._panelData.runs = allRuns.filter(({ definition }) => definition === 'PHYSICS');
            } else {
                this._panelData.runs = allRuns;
            }

            const { runsCounter } = this._updateLhcFillStatistics(this._lhcFill, this._panelData.runs);
            this._panelData.runsCounter = runsCounter;
            this.notify();
        }
    }

    /**
     * Update the statistics of a given fill, eventually after filtering runs and return the runs counter
     *
     * @param {LhcFill} lhcFill the fill for which statistics must be updated
     * @param {Run[]} runs the list of runs on which statistics must be computed
     * @return {{runsCounter: RunsCounter}} runs counter
     */
    _updateLhcFillStatistics(lhcFill, runs) {
        const extractor = new LhcFillStatisticsExtractor(lhcFill);
        const runsCounter = new RunsCounter();
        const tracker = new TimeBetweenRunsTracker();
        for (const run of runs) {
            extractor.addRun(run);
            runsCounter.addRun(run);
            tracker.trackRun(run);
        }

        addStatisticsToLhcFill(lhcFill, {
            ...extractor.statistics,
            timeElapsedBetweenRuns: tracker.total,
            runsHasMissingEdges: tracker.totalIsUnderEvaluated,
        }, true);

        return { runsCounter };
    }
}
