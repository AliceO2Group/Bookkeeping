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
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { breadcrumbs } from '../../../components/common/navigation/breadcrumbs.js';

const TABLEROW_HEIGHT = 42;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Simulation Passes overview page
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
            h('h2', 'Monte Carlo'),
            h('.flex-row', [
                lhcPeriod.match({
                    Success: (payload) => breadcrumbs(h('h2', payload.name)),
                    Failure: (payload) => tooltip(iconWarning(), errorAlert(payload)),
                    Loading: () => spinner({ size: 2, absolute: false }),
                    NotAsked: () => tooltip(iconWarning(), errorAlert([{ detail: 'No data was asked for' }])),
                }),
            ]),
        ]),
        h('.w-100.flex-column', [
            table(
                simulationPasses,
                simulationPassesActiveColumns,
                { classes: '.table-sm' },
                null,
                { sort: simulationPassesPerLhcPeriodOverviewModel.sortModel },
            ),
            paginationComponent(simulationPassesPerLhcPeriodOverviewModel.pagination),
        ]),
    ]);
};
