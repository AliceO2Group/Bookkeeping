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
import { STATUS_ACRONYMS } from '../../../domain/enums/statusAcronyms.js';

const VISIBLE_BIN_COUNT = 32;

/**
 * Bar chart displaying environment status history occurrences
 *
 * @param {{statusHistory: string, count: number}[]} environmentHistoryOccurrences the environment history occurrences
 * @return {Component} the chart component
 */
export const environmentHistoryOccurrencesBarChartComponent = (environmentHistoryOccurrences) => {
    const visibleBins = environmentHistoryOccurrences.slice(0, VISIBLE_BIN_COUNT);
    const excessBins = environmentHistoryOccurrences.slice(VISIBLE_BIN_COUNT);
    const excessCount = excessBins.reduce((sum, { count }) => sum + count, 0);

    const points = visibleBins.map(({ statusHistory, count }) => ({
        x: statusHistory.split(',').map((status) => STATUS_ACRONYMS[status] ?? null).filter((acronym) => acronym).join(''),
        y: count,
    }));

    if (excessCount > 0) {
        points.push({
            x: 'Other',
            y: excessCount,
        });
    }

    return barChartComponent(points, {
        placeholder: 'No environment history on the given period',
        chartConfiguration: {
            axis: {
                x: {
                    label: 'Environments',
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
    });
};
