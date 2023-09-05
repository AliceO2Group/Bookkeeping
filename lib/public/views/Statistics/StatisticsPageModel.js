/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */
import { Observable, RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';

/**
 * Model storing state for the statistics page
 */
export class StatisticsPageModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        const now = new Date();
        const todayMidnight = new Date(now.getTime());
        todayMidnight.setHours(0, 0, 0, 0);
        const startOfYearMidnight = new Date(todayMidnight.getTime());
        startOfYearMidnight.setDate(1);
        startOfYearMidnight.setMonth(0);
        const tomorrowMidnight = new Date(todayMidnight.getTime() + 24 * 3600 * 1000);

        const timezoneOffset = now.getTimezoneOffset();

        /**
         * @type {Period}
         * @private
         */
        this._period = {
            from: new Date(startOfYearMidnight.getTime() - timezoneOffset * 60 * 1000),
            to: new Date(tomorrowMidnight.getTime() - timezoneOffset * 60 * 1000),
        };

        /**
         * @type {RemoteData<LhcFillStatistics, *>}
         * @private
         */
        this._statistics = RemoteData.notAsked();
        this._fetchStatistics();
    }

    /**
     * Fetch the statistics for the default period
     *
     * @return {Promise<void>} resolve once the statistics are retrieved
     * @private
     */
    async _fetchStatistics() {
        this._statistics = RemoteData.loading();
        this.notify();

        try {
            const { data: statistics } = await getRemoteData(`/api/statistics/lhcFills?from=${this._period.from}&to=${this._period.to}`);
            this._statistics = RemoteData.success(statistics);
        } catch (error) {
            this._statistics = RemoteData.failure(error);
        }
        this.notify();
    }

    /**
     * Return the current statistics
     *
     * @return {RemoteData<LhcFillStatistics, *>} the statistics
     */
    get statistics() {
        return this._statistics;
    }
}
