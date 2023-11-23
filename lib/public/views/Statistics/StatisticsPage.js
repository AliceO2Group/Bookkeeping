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
import { detectorsEfficienciesComponent } from './charts/detectorsEfficienciesComponent.js';
import { switchInput } from '../../components/common/form/switchInput.js';
import { ChartDarkColors } from './chartColors.js';
import { tagOccurrencesBarChartComponent } from './charts/tagOccurrencesBarChartComponent.js';
import { timeRangeFilter } from '../../components/Filters/common/filters/timeRangeFilter.js';
import { eorReasonOccurrencesBarChartComponent } from './charts/eorReasonOccurrencesBarChartComponent.js';
import { formatTimeRange } from '../../components/common/formatting/formatTimeRange.js';

/**
 * Render the statistics page
 *
 * @param {StatisticsPageModel} statisticsModel the page's model
 * @return {vnode} the resulting component
 * @constructor
 */
export const StatisticsPage = ({ statisticsModel }) => {
    let { periodLabel } = statisticsModel.timeRangeFilterModel;
    if (periodLabel === null) {
        periodLabel = formatTimeRange(statisticsModel.timeRangeFilterModel.normalized);
    }

    return h('.flex-grow.flex-column', [
        h('.flex-row.g3.items-center', [
            h('h1', 'Statistics'),
            timeRangeFilter(statisticsModel.timeRangeFilterModel),
        ]),
        tabbedPanelComponent(
            statisticsModel.tabbedPanelModel,
            {
                [STATISTICS_PANELS_KEYS.LHC_FILL_EFFICIENCY]: 'Efficiency',
                [STATISTICS_PANELS_KEYS.WEEKLY_FILE_SIZE]: 'Weekly file size',
                [STATISTICS_PANELS_KEYS.MEAN_RUN_DURATION]: 'Mean run duration',
                [STATISTICS_PANELS_KEYS.TIME_BETWEEN_RUNS_DISTRIBUTION]: 'Time between runs',
                [STATISTICS_PANELS_KEYS.EFFICIENCY_PER_DETECTOR]: 'Detector efficiency',
                [STATISTICS_PANELS_KEYS.LOG_TAG_OCCURRENCES]: 'Tag occurrences in logs',
                [STATISTICS_PANELS_KEYS.EOR_REASON_OCCURRENCES]: 'End of run reason occurrences',
            },
            {
                [STATISTICS_PANELS_KEYS.LHC_FILL_EFFICIENCY]: (remoteData) => remoteDataDisplay(remoteData, {
                    Success: (fillStatistics) => [
                        h('h3', `Efficiency - ${periodLabel}`),
                        h(
                            '.flex-grow.chart-box',
                            efficiencyChartComponent(fillStatistics, () => statisticsModel.notify()),
                        ),
                    ],
                }),
                [STATISTICS_PANELS_KEYS.WEEKLY_FILE_SIZE]: (remoteData) => remoteDataDisplay(remoteData, {
                    Success: (weeklyDataSize) => [
                        h('h3', `Weekly data size - ${periodLabel}`),
                        h(
                            '.flex-grow.chart-box',
                            weeklyDataSizeChartComponent(weeklyDataSize, () => statisticsModel.notify()),
                        ),
                    ],
                }),
                [STATISTICS_PANELS_KEYS.MEAN_RUN_DURATION]: (remoteData) => remoteDataDisplay(remoteData, {
                    Success: (fillStatistics) => [
                        h('h3', `Mean run duration - ${periodLabel}`),
                        h(
                            '.flex-grow.chart-box',
                            meanRunDurationChartComponent(fillStatistics, () => statisticsModel.notify()),
                        ),
                    ],
                }),
                [STATISTICS_PANELS_KEYS.TIME_BETWEEN_RUNS_DISTRIBUTION]: (remoteData) => remoteDataDisplay(remoteData, {
                    Success: (histogram) => [
                        h('h3', `Time between runs - ${periodLabel}`),
                        h(
                            '.flex-grow.chart-box',
                            timeBetweenRunsHistogramComponent(histogram),
                        ),
                    ],
                }),
                [STATISTICS_PANELS_KEYS.EFFICIENCY_PER_DETECTOR]: (panelModel) => {
                    const detectorsColors = ChartDarkColors;
                    return remoteDataDisplay(panelModel.data, {
                        Success: (efficiencyPerDetectors) => [
                            h('h3', `Efficiency per detector - ${periodLabel}`),
                            h('.flex-row.g2', panelModel.detectors.map((detector, i) => switchInput(
                                panelModel.getDetectorVisibility(detector),
                                (visibility) => panelModel.setDetectorVisibility(detector, visibility),
                                { key: detector, labelAfter: detector, color: detectorsColors[i] },
                            ))),
                            h('.flex-row.flex-grow.g5', [
                                h(
                                    '.flex-grow.chart-box',
                                    detectorsEfficienciesComponent(
                                        efficiencyPerDetectors,
                                        false,
                                        panelModel.activeDetectors,
                                        detectorsColors.filter((_, i) => panelModel.getDetectorVisibility(panelModel.detectors[i])),
                                        () => statisticsModel.notify(),
                                    ),
                                ),
                                h(
                                    '.flex-grow.chart-box',
                                    detectorsEfficienciesComponent(
                                        efficiencyPerDetectors,
                                        true,
                                        panelModel.activeDetectors,
                                        detectorsColors.filter((_, i) => panelModel.getDetectorVisibility(panelModel.detectors[i])),
                                        () => statisticsModel.notify(),
                                    ),
                                ),
                            ]),
                        ],
                    });
                },
                [STATISTICS_PANELS_KEYS.LOG_TAG_OCCURRENCES]: (remoteData) => remoteDataDisplay(remoteData, {
                    Success: (tagOccurrences) => [
                        h('h3', `Tag occurrences in logs - ${periodLabel}`),
                        h('.flex-grow.chart-box', tagOccurrencesBarChartComponent(tagOccurrences)),
                    ],
                }),
                [STATISTICS_PANELS_KEYS.EOR_REASON_OCCURRENCES]: (remoteData) => remoteDataDisplay(remoteData, {
                    Success: (eorReasonOccurrences) => [
                        h('h3', `End of runs reason occurrences - ${periodLabel}`),
                        h('.flex-grow.chart-box', eorReasonOccurrencesBarChartComponent(eorReasonOccurrences)),
                    ],
                }),
            },
            { panelClass: ['p2', 'g3', 'flex-column', 'flex-grow'] },
        ),
    ]);
};
