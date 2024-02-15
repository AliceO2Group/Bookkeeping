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

import { h, iconPlus } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { qualityControlFlagsActiveColumns } from '../ActiveColumns/qualityControlFlagsActiveColumns.js';
import { qcFlagsChartComponent } from '../qcFlagsVisualization/qcFlagsVisualziationComponent.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { qualityControlFlagBreadcrum } from '../common/qualityControlBreadcrumbs.js';

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
    return h('', {
        onremove: () => qualityControlFlagsOverviewModel.reset(),
    }, [
        h('.flex-row.justify-between.items-center', [
            qualityControlFlagBreadcrum(run, dataPass, detector),
            frontLink(h('.flex-row.items-center.g1', [h('small', iconPlus()), 'QC']), 'quality-control-flag-create', {
                runNumber: qualityControlFlagsOverviewModel.runNumber,
                dataPassId: qualityControlFlagsOverviewModel.dataPassId,
                detectorId: qualityControlFlagsOverviewModel.detectorId,
            }, {
                class: 'btn btn-primary',
                title: 'Create a quality control flag',
            }),
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
