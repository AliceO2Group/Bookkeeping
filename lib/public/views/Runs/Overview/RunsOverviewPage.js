/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { runsActiveColumns } from '../ActiveColumns/runsActiveColumns.js';
import { exportRunsTriggerAndModal } from './exportRunsTriggerAndModal.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';

const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Build components in case of runs retrieval success
 * @param {Model} model model to access global functions
 * @return {Component} Returns a vnode with the table containing the runs
 */
export const RunsOverviewPage = ({ runs: { overviewModel: runsOverviewModel }, modalModel }) => {
    runsOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    return h('', [
        h('.flex-row.header-container.pv2', [
            filtersPanelPopover(runsOverviewModel, runsActiveColumns),
            exportRunsTriggerAndModal(runsOverviewModel, modalModel),
        ]),
        h('.flex-column.w-100', [
            table(runsOverviewModel.runs, runsActiveColumns),
            paginationComponent(runsOverviewModel.pagination),
        ]),
    ]);
};
