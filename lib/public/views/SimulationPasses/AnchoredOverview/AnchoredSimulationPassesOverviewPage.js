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

import { h, iconWarning } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { simulationPassesActiveColumns } from '../ActiveColumns/simulationPassesActiveColumns.js';
import { breadcrumbs } from '../../../components/common/navigation/breadcrumbs.js';
import spinner from '../../../components/common/spinner.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';

const TABLEROW_HEIGHT = 42;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Simulation Passes per Data Pass overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview screen
 */
export const AnchoredSimulationPassesOverviewPage = ({
    simulationPasses: { anchoredOverviewModel: anchoredSimulationPassesOverviewModel },
}) => {
    anchoredSimulationPassesOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const { items, dataPass, pagination } = anchoredSimulationPassesOverviewModel;

    const commonTitle = h('h2#breadcrumb-header', { style: 'white-space: nowrap;' }, 'Anchored MC');

    return h(
        '',
        {
            onremove: () => anchoredSimulationPassesOverviewModel.reset(),
        },
        [
            h('.flex-row.items-center.g2', [
                filtersPanelPopover(anchoredSimulationPassesOverviewModel, simulationPassesActiveColumns),
                h(
                    '.flex-row.g1.items-center',
                    dataPass.match({
                        Success: (payload) => breadcrumbs([commonTitle, h('h2#breadcrumb-simulation-pass-name', payload.name)]),
                        Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to load data pass info')],
                        Loading: () => [commonTitle, spinner({ size: 2, absolute: false })],
                        NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No data was asked for')],
                    }),
                ),
            ]),
            h('.w-100.flex-column', [
                table(
                    items,
                    simulationPassesActiveColumns,
                    { classes: '.table-sm' },
                    null,
                    { sort: anchoredSimulationPassesOverviewModel.sortModel },
                ),
                paginationComponent(pagination),
            ]),
        ],
    );
};
