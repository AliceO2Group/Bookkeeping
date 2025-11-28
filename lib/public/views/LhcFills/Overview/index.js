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
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
import { toggleStableBeamOnlyFilter } from '../../../components/Filters/LhcFillsFilter/stableBeamFilter.js';

const TABLEROW_HEIGHT = 53.3;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 230;

/**
 * The function to load the lhcFills overview
 * @param {Model} model The overall model object.
 * @returns {Object} The overview screen
 */
export const Index = (model) => h('', {
    onremove: () => model.lhcFills.clearOverview(),
}, showLhcFillsTable(model.lhcFills.overviewModel));

/**
 * The shows the LHC fills table
 *
 * @param {LhcFillsOverviewModel} lhcFillsOverviewModel the overview model
 *
 * @returns {Object} Html page
 */
const showLhcFillsTable = (lhcFillsOverviewModel) => {
    lhcFillsOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
        1,
    ));

    return [
        h('.flex-row.header-container.g2.pv2', [
            frontLink(h('button.btn.btn-primary', 'Statistics'), 'statistics'),
            filtersPanelPopover(lhcFillsOverviewModel, lhcFillsActiveColumns),
            toggleStableBeamOnlyFilter(lhcFillsOverviewModel),
        ]),
        h('.w-100.flex-column', [
            table(lhcFillsOverviewModel.items, lhcFillsActiveColumns, null, { tableClasses: '.table-sm' }),
            paginationComponent(lhcFillsOverviewModel.pagination),
        ]),
    ];
};
