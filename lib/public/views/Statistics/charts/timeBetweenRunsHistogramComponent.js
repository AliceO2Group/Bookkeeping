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
import { format } from '/assets/d3.min.js';
import { ChartColors } from '../chartColors.js';
import { barChartComponent } from '../../../components/common/chart/barChart/barChartComponent.js';

// TODO make this properly configurable in the model...
const MAX_OFFSET = 6;
const MINUTES_PER_OFFSET = 5;

const formatTimeRanges = (offset) => {
    if (offset === 0) {
        return `<= ${MINUTES_PER_OFFSET} min`;
    }

    if (offset >= MAX_OFFSET) {
        return `> ${MAX_OFFSET * MINUTES_PER_OFFSET} min`;
    }

    return `${offset * MINUTES_PER_OFFSET} - ${(offset + 1) * MINUTES_PER_OFFSET} min`;
};

/**
 * Render the time between runs histogram
 *
 * @param {Histogram} histogram the time between runs histogram
 * @return {Component} the resulting component
 */
export const timeBetweenRunsHistogramComponent = (histogram) => {
    let binIndex = 0;
    const points = new Array(histogram.max - histogram.min).fill(0).map((_, i) => {
        const { offset, count } = histogram.bins[binIndex];
        if (offset === i) {
            binIndex ++;
            return { x: i, y: count };
        }
        return { x: i, y: 0 };
    });

    return barChartComponent(points, {
        placeholder: 'No data on the given period',
        chartConfiguration: {
            forceZero: true,
            axis: {
                x: {
                    label: 'Time between runs',
                    ticks: { format: formatTimeRanges },
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
