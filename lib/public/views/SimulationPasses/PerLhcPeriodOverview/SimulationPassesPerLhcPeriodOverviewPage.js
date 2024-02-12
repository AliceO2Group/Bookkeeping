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
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { simulationPassesActiveColumns } from '../ActiveColumns/simulationPassesActiveColumns.js';
import spinner from '../../../components/common/spinner.js';

const TABLEROW_HEIGHT = 42;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Data Passes overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview screen
 */
export const SimulationPassesPerLhcPeriodOverviewPage = ({ simulationPasses: {
    perLhcPeriodOverviewModel: simulationPassesPerLhcPeriodOverviewModel } }) => {
    simulationPassesPerLhcPeriodOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const { items: simulationPasses, lhcPeriod } = simulationPassesPerLhcPeriodOverviewModel;

    return h('', {
        onremove: () => simulationPassesPerLhcPeriodOverviewModel.reset(),
    }, [
        h('.flex-row.items-center.g2', [
            filtersPanelPopover(simulationPassesPerLhcPeriodOverviewModel, simulationPassesActiveColumns),
            lhcPeriod.match({
                Success: (payload) => h('h2', `Monte Carlo of ${payload.name}`),
                Failure: () => h('h2.danger', 'Failed to fetch LHC Period information'),
                Loading: () => h('.p1', spinner({ size: 2, absolute: false })),
                NotAsked: () => h('h2', 'Monte Carlo'),
            }),
        ]),
        h('.w-100.flex-column', [
            table(
                simulationPasses,
                simulationPassesActiveColumns,
                { classes: '.table-sm' },
                null,
                { sort: simulationPassesPerLhcPeriodOverviewModel.overviewSortModel },
            ),
            paginationComponent(simulationPassesPerLhcPeriodOverviewModel.pagination),
        ]),
    ]);
};
