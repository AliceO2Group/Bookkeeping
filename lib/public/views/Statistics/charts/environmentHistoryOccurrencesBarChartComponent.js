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
import { displayEnvironmentStatusHistory } from '../../Environments/format/displayEnvironmentStatusHistory.js';

/**
 * Bar chart displaying environment history occurrences
 *
 * @param {{environments: string, count: number}[]} environmentHistoryOccurrences the environment history occurrences
 * @return {Component} the chart component
 */
export const environmentHistoryOccurrencesBarChartComponent = (environmentHistoryOccurrences) => barChartComponent(
    environmentHistoryOccurrences.map(({ environments, count }) => ({
        x: displayEnvironmentStatusHistory(environments),
        y: count,
    })),
    {
        placeholder: 'No environment history on the given period',
        chartConfiguration: {
            axis: {
                x: {
                    label: 'Environments',
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
