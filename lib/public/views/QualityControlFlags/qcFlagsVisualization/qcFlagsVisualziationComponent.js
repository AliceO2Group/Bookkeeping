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

import { h } from '/js/src/index.js';
import { barChartComponent } from '../../../components/common/chart/barChart/barChartComponent.js';
import { ChartColors } from '../../../components/common/chart/rendering/chartColors.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { flagColoredBadge } from '../format/flagColoreBadge.js';
import { flagReasonToColorMapping } from '../format/flagReasonsColors.js';

/**
 * Create quality control flags visualiation in form of horizontall bar chart
 * @param {QualityControlFlag[]} flags flags
 * @param {Run} run the run ssociated with given flags
 * @param {function} [onPointHover] function called when a point is hovered
 * @return {Component} qc flags visualization
 */
export const flagsChartComponent = (flags, run, onPointHover) => barChartComponent(
    flags.map(({ flagReason, timeStart, timeEnd, verifications }) => ({
        y: flagReason.name,
        x: [timeStart, timeEnd],
        verifications,
        fill: flagReasonToColorMapping[flagReason.name],
    })),
    {
        placeholder: 'No runs on the given period',
        tooltip: ({ y: flagReason, verifications }, { x: timestamp }) => h('.flex-col', [
            h('.flex-row.g1', [
                `Reason: ${flagReason}`,
                flagColoredBadge(flagReason),
            ]),
            h('', `Time: ${formatTimestamp(timestamp, true)}`),
            h('.mv1', { style: { 'border-top': '1px solid' } }),
            verifications.length > 0
                ? [
                    'Verifications: ',
                    verifications.map((verification) => h('', `${verification.user.name} : ${verification.comment}`)),
                ] : 'Not verified',
        ]),
        onPointHover,
        chartConfiguration: {
            axis: {
                x: {
                    label: 'Time',
                    ticks: { format: (t) => formatTimestamp(t, true), overlapping: 'rotate' },
                    min: run.timeStart,
                    max: run.timeEnd,
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
