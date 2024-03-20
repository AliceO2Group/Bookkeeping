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
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';

/**
 * Return the efficiency chart component for a given fill statistics
 *
 * @param {LhcFillStatistics[]} statistics the statistics to represent
 * @param {function} [onPointHover] function called when a point is hovered
 * @return {Component} the resulting component
 */
export const meanRunDurationChartComponent = (statistics, onPointHover) => lineChartComponent(
    statistics.map(({ fillNumber, meanRunDuration }) => ({
        x: fillNumber,
        // Values are expressed in hours so that axis have ticks for every round hours
        y: meanRunDuration / 3600,
    })),
    {
        placeholder: 'No fill on the given period',
        tooltip: ({ x, y }) => h('', [
            h('h5', `Fill #${x}`),
            h('.flex-row.items-center.g2', [
                h('.tooltip-bullet', { style: `background-color: ${ChartColors.Blue.dark}` }),
                // Convert back value to seconds for display
                h('', `Duration: ${formatDuration(y * 3600)}`),
            ]),
        ]),
        onPointHover,
        chartConfiguration: {
            axis: {
                y: {
                    // Convert back value to seconds for display
                    ticks: { format: (efficiency) => formatDuration(efficiency * 3600) },
                    label: 'Mean run duration',
                },
                x: {
                    label: 'FILL',
                },
            },
            datasets: {
                point: {
                    fill: ChartColors.Blue.dark,
                    radius: 5,
                },
            },
        },
    },
);
