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
import { histogramComponent } from '../../../components/common/chart/histogram/histogramComponent.js';

// TODO make this properly configurable in the model...
const MAX_OFFSET = 6;
const MINUTES_PER_OFFSET = 5;

/**
 * Render the time between runs histogram
 *
 * @param {Histogram} histogram the time between runs histogram
 * @return {Component} the resulting component
 */
export const timeBetweenRunsHistogramComponent = (histogram) => histogramComponent(
    histogram,
    {
        placeholder: 'No data on the given period',
        chartConfiguration: {
            forceZero: true,
            axis: {
                x: {
                    label: 'Time between runs',
                    ticks: {
                        format: (offset) => offset <= MAX_OFFSET
                            ? `${offset * MINUTES_PER_OFFSET}min`
                            : `>${MAX_OFFSET * MINUTES_PER_OFFSET}min`,
                    },
                },
                y: {
                    label: 'Count',
                },
            },
            datasets: {
                fill: ChartColors.Blue.dark,
                stroke: ChartColors.Blue.light,
            },
            chartMargins: {
                right: 30,
            },
        },
    },
);
