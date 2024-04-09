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
import { barChartComponent } from '../../../components/common/chart/barChart/barChartComponent.js';
import { formatEorReason } from '../../Runs/format/formatEorReason.js';

/**
 * Bar chart displaying EoR reason occurrences
 *
 * @param {{category: string, title: string, count: number}[]} eorReasonOccurrences the EoR reason occurrences
 * @return {Comment} the chart component
 */
export const eorReasonOccurrencesBarChartComponent = (eorReasonOccurrences) => barChartComponent(
    eorReasonOccurrences.map(({ category, title, count }) => ({
        x: formatEorReason({ category, title }),
        y: count,
    })),
    {
        placeholder: 'No runs on the given period',
        chartConfiguration: {
            axis: {
                x: {
                    label: 'EoR reason',
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
