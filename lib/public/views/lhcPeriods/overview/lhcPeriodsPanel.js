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
import { lhcFillsActiveColumns } from '../ActiveColumns/lhcFillsActiveColumns.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';

const TABLEROW_HEIGHT = 46;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * The function to load the lhcPeriods overview
 * @param {Model} model The overall model object.
 * @returns {vnode} The overview screen
 */
export const Index = (model) => h('', {
    onremove: () => model.lhcPeriods.clearOverview(),
}, showLhcFillsTable(model.lhcPeriods.overviewModel));

/**
 * The shows the LHC periods table
 *
 * @param {LhcFillsOverviewModel} lhcPeriodsOverviewModel the overview model
 *
 * @returns {vnode} Html page
 */
const showLhcFillsTable = (lhcPeriodsOverviewModel) => {
    lhcPeriodsOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    return [
        h('.w-100.flex-column', [
            table(lhcPeriodsOverviewModel.lhcFills, lhcFillsActiveColumns, { classes: '.table-sm' }),
            paginationComponent(lhcPeriodsOverviewModel.pagination),
        ]),
    ];
};
