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

import { h, iconChevronRight, iconWarning } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { qualityControlFlagsActiveColumns } from '../ActiveColumns/qualityControlFlagsActiveColumns.js';
import { qcFlagsChartComponent } from '../qcFlagsVisualization/qcFlagsVisualziationComponent.js';
import spinner from '../../../components/common/spinner.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

const TABLEROW_HEIGHT = 35;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

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

    const { items, run, dataPass, detector } = qualityControlFlagsOverviewModel;

    /**
     * Create error info icon
     * @param {Error[]} errors errors list
     * @return {Component} icon
     */
    const errorInfoIcon = (errors) => h('.danger', tooltip(iconWarning(), errors?.map(({ title }) => title)));

    return h('', {
        onremove: () => qualityControlFlagsOverviewModel.reset(),
    }, [
        h('.flex-row.justify-between.items-center', [
            h('.flex-row.g1.items-center', [
                h('h2', 'QC'),
                iconChevronRight(),
                dataPass.match({
                    Success: (payload) => h('h2', frontLink(payload.name, 'runs-per-data-pass', { dataPassId: payload.id })),
                    Loading: () => spinner({ size: 2, absolute: false }),
                    Failure: errorInfoIcon,
                    NotAsked: errorInfoIcon,
                }),
                iconChevronRight(),
                run.match({
                    Success: (payload) => h('h2', frontLink(payload.runNumber, 'run-detail', { runNumber: payload.runNumber })),
                    Loading: () => spinner({ size: 2, absolute: false }),
                    Failure: errorInfoIcon,
                    NotAsked: errorInfoIcon,
                }),
                iconChevronRight(),
                detector.match({
                    Success: (payload) => h('h2', `${payload.name}`),
                    Loading: () => spinner({ size: 2, absolute: false }),
                    Failure: errorInfoIcon,
                    NotAsked: errorInfoIcon,
                }),
            ]),
        ]),
        h('.w-100.flex-column', [
            items.match({
                Success: (qcfPayload) => run.match({
                    Success: (runPayload) => qcFlagsChartComponent(qcfPayload, runPayload, () => qualityControlFlagsOverviewModel.notify()),
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
