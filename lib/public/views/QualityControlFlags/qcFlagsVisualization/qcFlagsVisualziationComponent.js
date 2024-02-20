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
import { ChartColors } from '../../../components/common/chart/rendering/chartColors.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { flagReasonToColorMapping } from '../common/flagReasonsColors.js';

/**
 * Create quality control flags visualiation in form of horizontall bar chart
 * @param {QualityControlFlag[]} flags flags
 * @param {Run} run the run ssociated with given flags
 * @return {Component} qc flags visualization
 */
export const qcFlagsChartComponent = (flags, run) => barChartComponent(
    flags.map((flag) => ({
        y: flag.flagReason.name,
        x: [flag.timeStart, flag.timeEnd],
        fill: flagReasonToColorMapping[flag.flagReason.name],
        ...flag,
    })),
    {
        placeholder: 'No runs on the given period',
        chartConfiguration: {
            axis: {
                x: {
                    label: 'Time',
                    ticks: { format: (t) => formatTimestamp(t, true), overlapping: 'rotate' },
                    min: run.timeTrgStart,
                    max: run.timeTrgEnd,
                },
                y: {
                    label: 'Reason',
                    ticks: { overlapping: 'rotate' },
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
