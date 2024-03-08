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
import { logsActiveColumns } from '../ActiveColumns/logsActiveColumns.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
import { excludeAnonymousLogAuthorToggle } from '../../../components/Filters/LogsFilter/author/authorFilter.js';

const TABLEROW_HEIGHT = 69;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Build components in case of logs retrieval success
 * @param {Model} model model to access global functions
 * @return {Component} Returns a vnode with the table containing the logs
 */
const logOverviewScreen = ({ logs: { overviewModel: logsOverviewModel } }) => {
    logsOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    return h('', [
        h('.flex-row.justify-between.header-container.pv2', [
            h('.flex-row.g3', [
                filtersPanelPopover(logsOverviewModel, logsActiveColumns),
                excludeAnonymousLogAuthorToggle(logsOverviewModel.authorFilter),
            ]),
            actionButtons(),
        ]),
        h('.w-100.flex-column', [
            table(logsOverviewModel.logs, logsActiveColumns, null, null, { sort: logsOverviewModel.overviewSortModel }),
            paginationComponent(logsOverviewModel.pagination),
        ]),
    ]);
};

/**
 * Returns the action buttons of the page
 *
 * @returns {Component} A button which will redirect to creation of logs
 */
const actionButtons = () => h('.flex-row.g3', [frontLink('Add Log Entry', 'log-create', null, { class: 'btn btn-primary h2' })]);

export default (model) => logOverviewScreen(model);
