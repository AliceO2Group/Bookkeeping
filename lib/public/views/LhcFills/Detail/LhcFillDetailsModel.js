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
import { fetchClient, Observable, RemoteData } from '/js/src/index.js';
import { addStatisticsToLhcFill } from '../../../services/lhcFill/addStatisticsToLhcFill.js';
import { LhcFillStatisticsExtractor } from '../../../services/lhcFill/LhcFillStatisticsExtractor.js';
import { RunsCount } from '../../../services/run/RunsCount.js';
import { TimeBetweenRunsTracker } from '../../../services/run/TimeBetweenRunsTracker.js';

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
            this._lhcFillDetails = RemoteData.Loading();
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

        const response = await fetchClient(`/api/lhcFills/${lhcFillNumber}`, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            const extractor = new LhcFillStatisticsExtractor(result.data);
            const runsCount = new RunsCount();
            const tracker = new TimeBetweenRunsTracker();
            for (const run of result.data.runs) {
                extractor.addRun(run);
                runsCount.addRun(run);
                tracker.trackRun(run);
            }
            addStatisticsToLhcFill(result.data, {
                ...extractor.statistics,
                timeElapsedBetweenRuns: tracker.total,
                runsHasMissingEdges: tracker.totalIsUnderEvaluated,
            });
            this._lhcFillDetails = RemoteData.success({
                lhcFill: result.data,
                runsCount,
            });
        } else {
            this._lhcFillDetails = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }
}
