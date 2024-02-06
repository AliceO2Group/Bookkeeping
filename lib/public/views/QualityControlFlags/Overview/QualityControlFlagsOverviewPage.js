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
import { ChartColors } from '../../Statistics/chartColors.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';

const TABLEROW_HEIGHT = 35;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

// eslint-disable-next-line require-jsdoc
const flagsVisulization = () => barChartComponent(
    [
        {
            y: 'a',
            x: [1206481949000, 1796481949000],
            fill: ChartColors.Blue.dark,
        },
        {
            y: 'aasdf',
            x: [1006481949000, 1196481949000],
            fill: ChartColors.Red.dark,
        },
        {
            y: 'sdfgsdfg',
            x: 1896481949000,
            fill: ChartColors.Red.light,
        },
    ],
    {
        placeholder: 'No runs on the given period',
        chartConfiguration: {
            axis: {
                x: {
                    label: 'Duration',
                    ticks: { format: (t) => formatTimestamp(t, true) },
                    min: 986481949000,
                    max: 2096481949000,
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
                    rotate: true,
                },
            },
            rotate: true,
            renderGrid: false,
            // forceZero: true,

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

    return h('', {
        onremove: () => qualityControlFlagsOverviewModel.reset(),
    }, [
        h('.w-100.flex-column', [
            flagsVisulization(),
            table(
                qualityControlFlagsOverviewModel.items,
                qualityControlFlagsActiveColumns,
                { classes: '.table-sm' },
                null,
                null,
            ),
            paginationComponent(qualityControlFlagsOverviewModel.pagination),
        ]),
    ]);
};
