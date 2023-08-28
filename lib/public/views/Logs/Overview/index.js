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
import { filtersPanel } from '../../../components/Filters/common/filtersPanel.js';
import { filtersToggleButton } from '../../../components/Filters/common/filtersToggleButton.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

const TABLEROW_HEIGHT = 69;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Table row header
 * @param {Model} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const logOverviewScreen = (model) => h('', showLogsTable(model, model.logs.getLogs()));

/**
 * Build components in case of logs retrieval success
 * @param {Model} model model to access global functions
 * @param {RemoteData} logs list of logs retrieved from server
 * @return {vnode[]} Returns a vnode with the table containing the logs
 */
const showLogsTable = (model, logs) => {
    model.logs.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    return [
        h('.flex-row.justify-between.header-container.pv2', [
            h('.flex-row.flex-grow.items-start', [
                filtersToggleButton(model.logs),
                filtersPanel(model, model.logs, logsActiveColumns),
            ]),
            actionButtons(),
        ]),
        h('.w-100.flex-column', [
            table(logs, logsActiveColumns, null, null, { sort: model.logs.overviewSortModel }),
            paginationComponent(model.logs.pagination),
        ]),
    ];
};

/**
 * Returns the action buttons of the page
 *
 * @returns {vnode} A button which will redirect to creation of logs
 */
const actionButtons = () => h('.flex-row.g3', [frontLink('Add Log Entry', 'log-create', null, { class: 'btn btn-primary h2' })]);

export default (model) => logOverviewScreen(model);
