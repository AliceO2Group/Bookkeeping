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

import { h } from '@aliceo2/web-ui-frontend';
import { table } from '../../../components/common/table/table.js';
import { lhcPeriodsActiveColumns } from '../ActiveColumns/lhcPeriodsActiveColumns.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';

const TABLEROW_HEIGHT = 42;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render LHC Periods overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview screen
 */
export const LhcPeriodsOverviewPage = ({ lhcPeriods: { overviewModel: lhcPeriodsOverviewModel } }) => {
    lhcPeriodsOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    return h('', {
        onremove: () => lhcPeriodsOverviewModel.reset(),
    }, [
        h('.flex-row.header-container.pv2', filtersPanelPopover(lhcPeriodsOverviewModel, lhcPeriodsActiveColumns)),
        h('.w-100.flex-column', [
            table(
                lhcPeriodsOverviewModel.lhcPeriods,
                lhcPeriodsActiveColumns,
                { classes: '.table-sm' },
                null,
                { sort: lhcPeriodsOverviewModel.overviewSortModel },
            ),
            paginationComponent(lhcPeriodsOverviewModel.pagination),
        ]),
    ]);
};
