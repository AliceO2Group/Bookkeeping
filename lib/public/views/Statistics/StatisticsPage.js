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
import errorAlert from '../../components/common/errorAlert.js';
import spinner from '../../components/common/spinner.js';
import { lineChartComponent } from '../../components/common/chart/lineChart/lineChartComponent.js';

/**
 * Render the statistics page
 *
 * @param {StatisticsPageModel} statisticsModel the page's model
 * @return {vnode} the resulting component
 * @constructor
 */
export const StatisticsPage = ({ statisticsModel }) => h('.flex-grow.flex-column', [
    h('h1', 'Statistics'),
    statisticsModel.statistics.match({
        NotAsked: () => null,
        Loading: () => spinner(),
        Failure: (errors) => errorAlert(errors),
        Success: (statistics) => [
            h('h3', 'Efficiency - 2023'),
            h(
                '.flex-grow.chart-box',
                lineChartComponent(
                    statistics.map(({ fillNumber, efficiency, efficiencyLossAtStart }) => ({
                        x: fillNumber,
                        y: [efficiency + efficiencyLossAtStart, efficiency],
                    })),
                    {
                        placeholder: 'No fill on the given period',
                        chartConfiguration: {
                            datasets: [
                                {
                                    point: {
                                        fill: 'red',
                                    },
                                    line: {
                                        stroke: 'red',
                                        fill: 'rgb(255, 180, 180)',
                                    },
                                },
                                {
                                    point: {
                                        fill: 'blue',
                                    },
                                    line: {
                                        stroke: 'blue',
                                        fill: 'rgb(180, 180, 255)',
                                    },
                                },
                            ],
                        },
                    },
                ),
            ),
        ],
    }),
]);
