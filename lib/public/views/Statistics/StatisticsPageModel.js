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
import { TabbedPanelModel } from '../../components/TabbedPanel/TabbedPanelModel.js';

export const STATISTICS_PANELS_KEYS = {
    LHC_FILL_EFFICIENCY: 'lhc-fill-efficiency',
    WEEKLY_FILE_SIZE: 'weekly-file-size',
};

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

        this._tabbedPanelModel = new StatisticsTabbedPanelModel();
        this._tabbedPanelModel.bubbleTo(this);
        this._tabbedPanelModel.period = this._period;
    }

    /**
     * Load the page with given parameters
     *
     * @param {object} queryParams the current query parameters
     * @param {string} [queryParams.panel] the tab panel key
     * @return {void}
     */
    load(queryParams) {
        const { panel } = queryParams;
        this._tabbedPanelModel.currentPanelKey = panel;
    }

    /**
     * Returns the tabbed panel model
     *
     * @return {StatisticsTabbedPanelModel} the panel model
     */
    get tabbedPanelModel() {
        return this._tabbedPanelModel;
    }
}

/**
 * Sub-model for statistics tabs
 */
class StatisticsTabbedPanelModel extends TabbedPanelModel {
    /**
     * Constructor
     */
    constructor() {
        super(Object.values(STATISTICS_PANELS_KEYS));
    }

    /**
     * Set the statistics period
     *
     * @param {Period} period the statistics period
     */
    set period(period) {
        this._period = period;
        this._fetchCurrentPanelData();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _fetchCurrentPanelData() {
        switch (this.currentPanelKey) {
            case STATISTICS_PANELS_KEYS.LHC_FILL_EFFICIENCY:
                this._fetchEndpointForPanelData(`/api/statistics/lhcFills?from=${this._period.from}&to=${this._period.to}`);
                break;
            case STATISTICS_PANELS_KEYS.WEEKLY_FILE_SIZE:
                this._fetchEndpointForPanelData(`/api/statistics/runs/weeklyDataSize?from=${this._period.from}&to=${this._period.to}`);
                break;
        }
    }

    /**
     * Fetch an endpoint and save the resulting data as current panel data
     *
     * @param {string} endpoint the endpoint to fetch
     * @return {void}
     * @private
     */
    async _fetchEndpointForPanelData(endpoint) {
        this.currentPanelData = RemoteData.loading();
        this.notify();

        const abortController = new AbortController();
        try {
            if (this._abortController) {
                this._abortController.abort();
            }
            this._abortController = abortController;
            const { data: weeklyDataSize } = await getRemoteData(endpoint, { signal: this._abortController.signal });
            this.currentPanelData = RemoteData.success(weeklyDataSize);
        } catch (error) {
            // Use local variable because the class member (this._abortController) may already have been override in another call
            if (!abortController.signal.aborted) {
                this.currentPanelData = RemoteData.failure(error);
            }
        }
        this.notify();
    }
}
