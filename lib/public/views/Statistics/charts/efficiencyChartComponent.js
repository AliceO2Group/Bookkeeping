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
import { lineChartComponent } from '../../../components/common/chart/lineChart/lineChartComponent.js';
import { h } from '/js/src/index.js';
import { ChartColors } from '../chartColors.js';
import { formatPercentage } from '../../../utilities/formatting/formatPercentage.js';

/**
 * Format the given efficiency in percentage
 * @param {number} efficiency the efficiency to format
 * @return {string} the formatted efficiency
 */
/**
 * Return the efficiency chart component for a given fill statistics
 *
 * @param {LhcFillStatistics[]} statistics the statistics to represent
 * @param {function} [onPointHover] function called when a point is hovered
 * @return {Component} the resulting component
 */
export const efficiencyChartComponent = (statistics, onPointHover) => lineChartComponent(
    statistics.map(({ fillNumber, efficiency, efficiencyLossAtStart }) => ({
        x: fillNumber,
        y: [efficiency + efficiencyLossAtStart, efficiency],
    })),
    {
        placeholder: 'No fill on the given period',
        tooltip: ({ x, y }) => h('', [
            h('h5', `Fill #${x}`),
            h('.flex-row.items-center.g2', [
                h('.tooltip-bullet', { style: `background-color: ${ChartColors.Blue.dark}` }),
                h('', `Efficiency: ${formatPercentage(y[1], 0)}`),
            ]),
            h('.flex-row.items-center.g2', [
                h('.tooltip-bullet', { style: `background-color: ${ChartColors.Red.dark}` }),
                h('', `Eff. loss at start: ${formatPercentage(y[0] - y[1], 2)}`),
            ]),
        ]),
        onPointHover,
        chartConfiguration: {
            axis: {
                y: {
                    ticks: { format: (efficiency) => formatPercentage(efficiency, 0) },
                    label: 'Efficiency',
                    min: 0,
                    max: 1,
                },
                x: {
                    label: 'FILL',
                },
            },
            datasets: [
                {
                    point: {
                        fill: ChartColors.Red.dark,
                        radius: 5,
                    },
                    line: {
                        stroke: ChartColors.Red.dark,
                        fill: ChartColors.Red.light,
                    },
                },
                {
                    point: {
                        fill: ChartColors.Blue.dark,
                        radius: 5,
                    },
                    line: {
                        stroke: ChartColors.Blue.dark,
                        fill: ChartColors.Blue.light,
                    },
                },
            ],
        },
    },
);
