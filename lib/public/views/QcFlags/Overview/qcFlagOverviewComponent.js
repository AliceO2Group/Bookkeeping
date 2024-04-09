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
import { qcFlagsActiveColumns } from '../ActiveColumns/qcFlagsActiveColumns.js';

const TABLEROW_HEIGHT = 35;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Quality Control Flags Overview component
 * @param {QcFlagsOverviewModel} qcFlagsModel QC flags overview model
 * @returns {Component} The overview component
 */
export const QcFlagsOverviewComponenet = (qcFlagsModel) => {
    qcFlagsModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const {
        items: qcFlags,
    } = qcFlagsModel;

    return h('.w-100.flex-column', [
        table(
            qcFlags,
            qcFlagsActiveColumns,
            { classes: '.table-sm' },
            null,
            { sort: qcFlagsModel.sortModel },
        ),
        paginationComponent(qcFlagsModel.pagination),
    ]);
};
