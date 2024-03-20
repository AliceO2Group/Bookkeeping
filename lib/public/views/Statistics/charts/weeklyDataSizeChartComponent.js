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
import { h } from '@aliceo2/web-ui/Frontend/js/src/index.js';
import { ChartColors } from '../chartColors.js';

/**
 * Format the given data size in human-readable format
 * @param {number} dataSize the efficiency to format
 * @return {string} the formatted efficiency
 */
const formatDataSize = (dataSize) => dataSize;

/**
 * Return the efficiency chart component for a given fill statistics
 *
 * @param {WeeklyDataSize[]} weeklyDataSize the weekly data size to represent
 * @param {function} [onPointHover] function called when a point is hovered
 * @return {Component} the resulting component
 */
export const weeklyDataSizeChartComponent = (weeklyDataSize, onPointHover) => lineChartComponent(
    weeklyDataSize.map(({ week, year, size }) => ({
        x: `${year} - ${week}`,
        // To have 3 digit precision, divide first by 1e12 using BigInt then by 1e3 using float computation
        y: Number(BigInt(size) / BigInt(1e12)) / 1e3,
    })),
    {
        placeholder: 'No data on the given period',
        tooltip: ({ x, y }) => h('', [
            h('h5', `Data size ${x}`),
            h('.flex-row.items-center.g2', [
                h('.tooltip-bullet', { style: `background-color: ${ChartColors.Blue.dark}` }),
                h('', `Data size: ${formatDataSize(y)}PB`),
            ]),
        ]),
        onPointHover,
        chartConfiguration: {
            axis: {
                y: {
                    ticks: { format: (dataSize) => formatDataSize(dataSize) },
                    label: 'Data size (PB)',
                },
                x: {
                    label: 'Year - Week',
                },
            },
            datasets: {
                point: {
                    fill: ChartColors.Blue.dark,
                    radius: 5,
                },
                line: {
                    stroke: ChartColors.Blue.dark,
                    fill: ChartColors.Blue.light,
                },
            },
            chartMargins: {
                right: 30,
            },
        },
    },
);
