/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { barChartComponent } from '../../../components/common/chart/barChart/barChartComponent.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { ChartColors } from '../../Statistics/chartColors.js';

/**
 * Create QC flags visualiation as horizontall bar chart
 * @param {QualityControlFlag[]} flags flags
 * @param {Run} run the run associated with given flags
 * @return {Component} qc flags visualization
 */
export const qcFlagsChartComponent = (flags, run) => {
    console.log(flags.map((flag) => flag));

    return barChartComponent(
        flags.map((flag) => ({
            ...flag,
            y: `${flag.flagType.name} (id:${flag.id})`,
            // y: 't',
            x: [flag.from, flag.to],
            fill: flag.flagType.color,
        })),
        {
            placeholder: 'No data',
            chartConfiguration: {
                axis: {
                    x: {
                        label: 'Time',
                        ticks: { format: (t) => formatTimestamp(t, true) },
                        min: run.timeTrgStart ?? run.timeO2Start,
                        max: run.timeTrgEnd ?? run.timeO2End,
                    },
                    y: {
                        label: 'Type',
                        // ticks: { overlapping: 'rotate' },
                    },
                },
                datasets: {
                    bar: {
                        fill: ChartColors.Blue.dark,
                        stroke: ChartColors.Blue.light,
                    },
                },
                independentVariable: 'y',
                renderGrid: false,
            },
        },
    );
}