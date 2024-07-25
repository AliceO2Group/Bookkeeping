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
import { switchInput } from '../../../components/common/form/switchInput.js';

const TABLEROW_HEIGHT = 46;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Display a toggle switch to display stable beams only
 *
 * @param {LhcFillsOverviewModel} lhcFillsOverviewModel the overview model
 * @returns {Component} the toggle switch
 */
export const toggleStableBeamOnlyFilter = (lhcFillsOverviewModel) => {
    const isStableBeamsOnly = lhcFillsOverviewModel.isStableBeamsOnly();
    const onChange = isStableBeamsOnly
        ? () => lhcFillsOverviewModel.setStableBeamsFilter(false)
        : () => lhcFillsOverviewModel.setStableBeamsFilter(true);
    return switchInput(isStableBeamsOnly, onChange, { labelAfter: 'STABLE BEAM ONLY' });
};

/**
 * The function to load the lhcFillironment overview
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
    ));

    return [
        h('.flex-row.header-container.g2.pv2', [
            frontLink(h('button.btn.btn-primary', 'Statistics'), 'statistics'),
            toggleStableBeamOnlyFilter(lhcFillsOverviewModel),
        ]),
        h('.w-100.flex-column', [
            table(lhcFillsOverviewModel.items, lhcFillsActiveColumns, { classes: '.table-sm' }),
            paginationComponent(lhcFillsOverviewModel.pagination),
        ]),
    ];
};
