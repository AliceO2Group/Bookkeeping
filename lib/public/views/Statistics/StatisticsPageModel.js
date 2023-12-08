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
import { TabbedPanelModel } from '../../components/TabbedPanel/TabbedPanelModel.js';
import { buildUrl } from '../../utilities/fetch/buildUrl.js';
import { RemoteDataSource } from '../../utilities/fetch/RemoteDataSource.js';
import { TimeRangeFilterModel } from '../../components/Filters/common/filters/TimeRangeFilterModel.js';
import { getStartOfDay, getStartOfYear, MILLISECONDS_IN_ONE_DAY } from '../../utilities/dateUtils.js';

export const STATISTICS_PANELS_KEYS = {
    LHC_FILL_EFFICIENCY: 'lhc-fill-efficiency',
    MEAN_RUN_DURATION: 'mean-run-duration',
    WEEKLY_FILE_SIZE: 'weekly-file-size',
    TIME_BETWEEN_RUNS_DISTRIBUTION: 'time-between-runs-distribution',
    EFFICIENCY_PER_DETECTOR: 'efficiency-per-detector',
    LOG_TAG_OCCURRENCES: 'log-tag-occurrences',
    EOR_REASON_OCCURRENCES: 'eor-reasons-occurrences',
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

        const period = {
            from: getStartOfYear().getTime(),
            to: new Date(getStartOfDay().getTime() + MILLISECONDS_IN_ONE_DAY).getTime(),
        };
        this._timeRangeFilterModel = new TimeRangeFilterModel(period, `${new Date(period.from).getUTCFullYear()}`, { required: true });
        this._timeRangeFilterModel.visualChange$.bubbleTo(this);

        this._tabbedPanelModel = new StatisticsTabbedPanelModel();
        this._tabbedPanelModel.bubbleTo(this);

        this._timeRangeFilterModel.observe(() => {
            if (this._timeRangeFilterModel.isValid) {
                this._tabbedPanelModel.period = this._timeRangeFilterModel.normalized;
            }
        });
        this._timeRangeFilterModel.bubbleTo(this);

        // Notify to update panel period
        this._timeRangeFilterModel.notify();
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

    /**
     * Return the model for time range filter
     *
     * @return {TimeRangeFilterModel} the time range filter model
     */
    get timeRangeFilterModel() {
        return this._timeRangeFilterModel;
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
        this._remoteDataFetcher = new RemoteDataSource();
        this._remoteDataFetcher.observableData.bubbleTo(this);
        this._detectorEfficiencyTabModel = new DetectorsEfficienciesTabModel();
        this._detectorEfficiencyTabModel.bubbleTo(this);
    }

    /**
     * Set the statistics period
     *
     * @param {Period} period the statistics period
     */
    set period(period) {
        this._period = period;
        this._detectorEfficiencyTabModel.period = period;
        this._fetchCurrentPanelData();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _fetchCurrentPanelData() {
        switch (this.currentPanelKey) {
            case STATISTICS_PANELS_KEYS.LHC_FILL_EFFICIENCY:
            case STATISTICS_PANELS_KEYS.MEAN_RUN_DURATION:
                this._fetchEndpointForPanelData(buildUrl('/api/statistics/lhcFills', { from: this._period.from, to: this._period.to }));
                break;
            case STATISTICS_PANELS_KEYS.WEEKLY_FILE_SIZE:
                this._fetchEndpointForPanelData(buildUrl(
                    '/api/statistics/runs/weeklyDataSize',
                    { from: this._period.from, to: this._period.to },
                ));
                break;
            case STATISTICS_PANELS_KEYS.TIME_BETWEEN_RUNS_DISTRIBUTION:
                // eslint-disable-next-line max-len
                this._fetchEndpointForPanelData(buildUrl(
                    '/api/statistics/runs/timeBetweenRunsDistribution',
                    { from: this._period.from, to: this._period.to },
                ));
                break;
            case STATISTICS_PANELS_KEYS.LOG_TAG_OCCURRENCES:
                // eslint-disable-next-line max-len
                this._fetchEndpointForPanelData(buildUrl(
                    '/api/statistics/logs/tagsOccurrences',
                    { from: this._period.from, to: this._period.to },
                ));
                break;
            case STATISTICS_PANELS_KEYS.EOR_REASON_OCCURRENCES:
                // eslint-disable-next-line max-len
                this._fetchEndpointForPanelData(buildUrl(
                    '/api/statistics/runs/eorReasonsOccurrences',
                    { from: this._period.from, to: this._period.to },
                ));
                break;
            case STATISTICS_PANELS_KEYS.EFFICIENCY_PER_DETECTOR:
                this._detectorEfficiencyTabModel.fetch();
                break;
        }
    }

    /**
     * If the currently selected period correspond to a specific period (for ex current month), returns its label
     *
     * @return {string} the current period label if it applies
     */
    get periodLabel() {
        return null;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get currentPanelData() {
        switch (this.currentPanelKey) {
            case STATISTICS_PANELS_KEYS.LHC_FILL_EFFICIENCY:
            case STATISTICS_PANELS_KEYS.MEAN_RUN_DURATION:
            case STATISTICS_PANELS_KEYS.WEEKLY_FILE_SIZE:
            case STATISTICS_PANELS_KEYS.TIME_BETWEEN_RUNS_DISTRIBUTION:
            case STATISTICS_PANELS_KEYS.LOG_TAG_OCCURRENCES:
            case STATISTICS_PANELS_KEYS.EOR_REASON_OCCURRENCES:
                return this._remoteDataFetcher.observableData.current;
            case STATISTICS_PANELS_KEYS.EFFICIENCY_PER_DETECTOR:
                return this._detectorEfficiencyTabModel;
        }
        return null;
    }

    /**
     * Fetch an endpoint and save the resulting data as current panel data
     *
     * @param {string} endpoint the endpoint to fetch
     * @return {void}
     * @private
     */
    _fetchEndpointForPanelData(endpoint) {
        this._remoteDataFetcher.fetch(endpoint);
    }
}

/**
 * Model to store the state of the detectors efficiencies tab
 */
class DetectorsEfficienciesTabModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._period = null;

        /**
         * @type {RemoteData<string[]>}
         * @private
         */
        this._detectors = RemoteData.notAsked();

        this._remoteDataFetcher = new RemoteDataSource();
        this._remoteDataFetcher.observableData.observe(() => {
            this._detectors = this._remoteDataFetcher.observableData.current.match({
                NotAsked: () => RemoteData.notAsked(),
                Loading: () => RemoteData.loading(),
                Success: (detectorEfficiency) => RemoteData.success(detectorEfficiency.reduce((detectors, { efficiencies }) => {
                    for (const detector in efficiencies) {
                        if (!detectors.includes(detector)) {
                            detectors.push(detector);
                        }
                    }
                    detectors.sort((a, b) => a.localeCompare(b));
                    return detectors;
                }, [])),
                Failure: (error) => RemoteData.failure(error),
            });

            this.notify();
        });

        /**
         * @type {Map<string, boolean>}
         * @private
         */
        this._detectorsVisibility = new Map();
    }

    /**
     * Fetch the tab data
     * @return {void}
     */
    fetch() {
        this._remoteDataFetcher.fetch(buildUrl(
            '/api/statistics/runs/detectorEfficiency',
            { from: this._period.from, to: this._period.to },
        ));
    }

    /**
     * Return the current tab data
     *
     * @return {RemoteData} the tab data
     */
    get data() {
        return this._remoteDataFetcher.observableData.current;
    }

    /**
     * Return the current period
     *
     * @return {Period} the current period
     */
    get period() {
        return this._period;
    }

    /**
     * Set the period
     *
     * @param {Period} period set current period
     */
    set period(period) {
        this._period = period;
    }

    /**
     * Return the list of all the detectors that have statistics
     *
     * @return {RemoteData<string[]>} the detectors
     */
    get detectors() {
        return this._detectors;
    }

    /**
     * Returns the visibility of a given detector
     *
     * @param {string} detector the detector
     * @return {boolean} the detector's visibility
     */
    getDetectorVisibility(detector) {
        return this._detectorsVisibility.get(detector) || false;
    }

    /**
     * Defines the visibility of a given detector
     *
     * @param {string} detector the detector
     * @param {boolean} visibility true if it should be visible
     * @return {void}
     */
    setDetectorVisibility(detector, visibility) {
        this._detectorsVisibility.set(detector, visibility);
        this.notify();
    }
}
