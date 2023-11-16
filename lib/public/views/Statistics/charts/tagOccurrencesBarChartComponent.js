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

import { ChartColors } from '../chartColors.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { h } from '/js/src/index.js';
import { barChartComponent } from '../../../components/common/chart/barChart/barChartComponent.js';

/**
 * Bar chart displaying tag occurrences
 *
 * @param {{tag: string, count: number}[]} tagsOccurrences the tags occurrences
 * @return {Comment} the chart component
 */
export const tagOccurrencesBarChartComponent = (tagsOccurrences) => barChartComponent(
    tagsOccurrences.map(({ tag, count }) => ({
        x: tag,
        y: count,
    })),
    {
        placeholder: 'No log on the given period',
        tooltip: ({ x, y }) => h('', [
            h('h5', `Fill #${x}`),
            h('.flex-row.items-center.g2', [
                h('.tooltip-bullet', { style: `background-color: ${ChartColors.Blue.dark}` }),
                // Convert back value to seconds for display
                h('', `Duration: ${formatDuration(y * 3600)}`),
            ]),
        ]),
        chartConfiguration: {
            axis: {
                x: {
                    label: 'Tag',
                    ticks: { overlapping: 'rotate' },
                },
                y: {
                    label: 'Count',
                    ticks: { format: (t) => Number.isInteger(t) ? t : null },
                    min: 0,
                },
            },
            datasets: {
                bar: {
                    fill: ChartColors.Blue.dark,
                    stroke: ChartColors.Blue.light,
                },
            },
        },
    },
);
