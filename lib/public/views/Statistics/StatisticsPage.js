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
import { h } from '/js/src/index.js';
import { tabbedPanelComponent } from '../../components/TabbedPanel/tabbedPanelComponent.js';
import { STATISTICS_PANELS_KEYS } from './StatisticsPageModel.js';
import { efficiencyChartComponent } from './charts/efficiencyChartComponent.js';
import { remoteDataDisplay } from '../../components/common/remoteDataDisplay.js';
import { weeklyDataSizeChartComponent } from './charts/weeklyDataSizeChartComponent.js';
import { meanRunDurationChartComponent } from './charts/meanRunDurationChartComponent.js';
import { timeBetweenRunsHistogramComponent } from './charts/timeBetweenRunsHistogramComponent.js';

/**
 * Render the statistics page
 *
 * @param {StatisticsPageModel} statisticsModel the page's model
 * @return {vnode} the resulting component
 * @constructor
 */
export const StatisticsPage = ({ statisticsModel }) => h('.flex-grow.flex-column', [
    h('h1', 'Statistics'),
    tabbedPanelComponent(
        statisticsModel.tabbedPanelModel,
        {
            [STATISTICS_PANELS_KEYS.LHC_FILL_EFFICIENCY]: 'Efficiency',
            [STATISTICS_PANELS_KEYS.WEEKLY_FILE_SIZE]: 'Weekly file size',
            [STATISTICS_PANELS_KEYS.MEAN_RUN_DURATION]: 'Mean run duration',
            [STATISTICS_PANELS_KEYS.TIME_BETWEEN_RUNS_DISTRIBUTION]: 'Time between runs',
        },
        {
            [STATISTICS_PANELS_KEYS.LHC_FILL_EFFICIENCY]: (remoteData) => remoteDataDisplay(remoteData, {
                Success: (fillStatistics) => [
                    h('h3', 'Efficiency - 2023'),
                    h(
                        '.flex-grow.chart-box',
                        efficiencyChartComponent(fillStatistics, () => statisticsModel.notify()),
                    ),
                ],
            }),
            [STATISTICS_PANELS_KEYS.WEEKLY_FILE_SIZE]: (remoteData) => remoteDataDisplay(remoteData, {
                Success: (weeklyDataSize) => [
                    h('h3', 'Weekly data size - 2023'),
                    h(
                        '.flex-grow.chart-box',
                        weeklyDataSizeChartComponent(weeklyDataSize, () => statisticsModel.notify()),
                    ),
                ],
            }),
            [STATISTICS_PANELS_KEYS.MEAN_RUN_DURATION]: (remoteData) => remoteDataDisplay(remoteData, {
                Success: (fillStatistics) => [
                    h('h3', 'Mean run duration - 2023'),
                    h(
                        '.flex-grow.chart-box',
                        meanRunDurationChartComponent(fillStatistics, () => statisticsModel.notify()),
                    ),
                ],
            }),
            [STATISTICS_PANELS_KEYS.TIME_BETWEEN_RUNS_DISTRIBUTION]: (remoteData) => remoteDataDisplay(remoteData, {
                Success: (histogram) => [
                    h('h3', 'Time between runs - 2023'),
                    h(
                        '.flex-grow.chart-box',
                        timeBetweenRunsHistogramComponent(histogram),
                    ),
                ],
            }),
        },
        { panelClass: ['p2', 'flex-column', 'flex-grow'] },
    ),
]);
