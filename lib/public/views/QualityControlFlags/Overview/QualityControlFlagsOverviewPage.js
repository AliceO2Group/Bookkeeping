/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { qualityControlFlagsActiveColumns } from '../ActiveColumns/qualityControlFlagsActiveColumns.js';
import { barChartComponent } from '../../../components/common/chart/barChart/barChartComponent.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { ChartColors } from '../../../components/common/chart/rendering/chartColors.js';
import { flagReasonToColorMapping } from '../format/flagReasonsColors.js';
import { flagColoredBadge } from '../format/flagColoreBadge.js';

const TABLEROW_HEIGHT = 35;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

// eslint-disable-next-line require-jsdoc
const flagsChartComponent = (flags, run, onPointHover) => barChartComponent(
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

/**
 * Render Quality Control Flags Overview Model
 * @param {Model} model The overall model object.
 * @returns {Component} The overview screen
 */
export const QualityControlFlagsOverviewPage = ({ qualityControlFlagsModel: { overviewModel: qualityControlFlagsOverviewModel } }) => {
    qualityControlFlagsOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const { items, run } = qualityControlFlagsOverviewModel;

    return h('', {
        onremove: () => qualityControlFlagsOverviewModel.reset(),
    }, [
        h('.w-100.flex-column', [
            items.match({
                Success: (qcfPayload) => run.match({
                    Success: (runPayload) => flagsChartComponent(qcfPayload, runPayload, () => qualityControlFlagsOverviewModel.notify()),
                    Other: () => null,
                }),
                Other: () => null,
            }),
            table(
                items,
                qualityControlFlagsActiveColumns,
                { classes: '.table-sm' },
                null,
                null,
            ),
            paginationComponent(qualityControlFlagsOverviewModel.pagination),
        ]),
    ]);
};
