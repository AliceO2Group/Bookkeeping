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
import { filtersToggleButton } from '../../../components/Filters/common/filtersToggleButton.js';
import { filtersPanel } from '../../../components/Filters/common/filtersPanel.js';
import { toggleContainer } from '../../../components/common/toggle/toggleContainer.js';

const TABLEROW_HEIGHT = 46;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * The function to load the lhcFillironment overview
 * @param {Model} model The overall model object.
 * @returns {Object} The overview screen
 */
export const Index = (model) => h('', {
    onremove: () => model.lhcFills.clearOverview(),
}, showLhcFillsTable(model));

/**
 * The shows the LHC fills table
 *
 * @param {Model} model the overview model
 *
 * @returns {Object} Html page
 */
const showLhcFillsTable = (model) => {
    const { overviewModel } = model.lhcFills;

    overviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    return [
        h(
            '.flex-row.header-container.pv2',
            [
                filtersToggleButton(overviewModel.filtering.toggleModel),
                toggleContainer(
                    overviewModel.filtering.toggleModel,
                    overviewModel.filtering.toggleModel.isVisible && filtersPanel(model, overviewModel.filtering, lhcFillsActiveColumns),
                    overviewModel.filtering.toggleModel.isVisible ? { class: 'w-25 filters' } : null,
                ),
                h(
                    `.w-50.filters${overviewModel.filtering.isAnyFilterActive() && !overviewModel.filtering.toggleModel.isVisible
                        ? '.display-block'
                        : '.display-none'}`,
                    h('.f5'),
                    `Active filters: ${overviewModel.filtering.activeFiltersNames}`,
                ),
            ],
        ),
        h('.w-100.flex-column', [
            table(overviewModel.lhcFills, lhcFillsActiveColumns, { classes: '.table-sm' }),
            paginationComponent(overviewModel.pagination),
        ]),
    ];
};
