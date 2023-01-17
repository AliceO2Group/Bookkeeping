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
import { RunsCount } from '../../../services/run/RunsCount.js';
import { TimeBetweenRunsTracker } from '../../../services/run/TimeBetweenRunsTracker.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';

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
        this._limitRunsToPhysics = true;
    }

    /**
     * Return the LHC fill represented by this model
     *
     * @return {RemoteData} the current lhc fill details, including lhcFill and runs count
     */
    get lhcFillDetails() {
        return this._lhcFillDetails;
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
            this._lhcFillDetails = RemoteData.notAsked();
        } else {
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
        this._lhcFillDetails = RemoteData.loading();
        this.notify();

        try {
            const { data: lhcFill } = await getRemoteData(`/api/lhcFills/${lhcFillNumber}`);

            const allRuns = [...lhcFill.runs];

            if (this._limitRunsToPhysics) {
                lhcFill.runs = lhcFill.runs.filter(({ definition }) => definition === 'PHYSICS');
            }

            const { runsCount } = this.updateLhcFillStatistics(lhcFill);

            this._lhcFillDetails = RemoteData.success({
                lhcFill,
                runsCount,
                allRuns,
            });
        } catch (error) {
            this._lhcFillDetails = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Update the statistics of a given fill, eventually after filtering runs and return the runs counter
     *
     * @param {LhcFill} lhcFill the fill for which statistics must be updated
     * @return {{runsCount: RunsCount}} runs counter
     */
    updateLhcFillStatistics(lhcFill) {
        const extractor = new LhcFillStatisticsExtractor(lhcFill);
        const runsCount = new RunsCount();
        const tracker = new TimeBetweenRunsTracker();
        for (const run of lhcFill.runs) {
            extractor.addRun(run);
            runsCount.addRun(run);
            tracker.trackRun(run);
        }

        addStatisticsToLhcFill(lhcFill, {
            ...extractor.statistics,
            timeElapsedBetweenRuns: tracker.total,
            runsHasMissingEdges: tracker.totalIsUnderEvaluated,
        }, true);

        return { runsCount };
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
        if (this._lhcFillDetails.isSuccess()) {
            const { lhcFill, allRuns } = this._lhcFillDetails.payload;

            if (value) {
                lhcFill.runs = allRuns.filter(({ definition }) => definition === 'PHYSICS');
            } else {
                lhcFill.runs = allRuns;
            }

            const { runsCount } = this.updateLhcFillStatistics(lhcFill);
            this._lhcFillDetails.payload.runsCount = runsCount;
        }
        this.notify();
    }
}
