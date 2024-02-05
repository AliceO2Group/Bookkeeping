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

    return h('', {
        onremove: () => qualityControlFlagsOverviewModel.reset(),
    }, [
        h('.w-100.flex-column', [
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
