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

const TABLEROW_HEIGHT = 69;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Table row header
 * @param {Model} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const logOverviewScreen = (model) => {
    const data = model.logs.getLogs();
    return h('', showLogsTable(model, data));
};

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
        h('.flex-row.header-container.pv2', [
            filtersToggleButton(model.logs),
            filtersPanel(model, model.logs, logsActiveColumns),
            h(
                `.w-50.filters${model.logs.isAnyFilterActive() && !model.logs.areFiltersVisible
                    ? '.display-block'
                    : '.display-none'}`,
                h('.f5'),
                `Active filters: ${model.logs.getActiveFilters().join(', ')}`,
            ),
            addLogsButton(model),
        ]),
        h('.w-100.flex-column', [
            table(logs, logsActiveColumns, null, null, { sort: model.logs.overviewSortModel }),
            paginationComponent(model.logs.pagination),
        ]),
    ];
};

/**
 * Builds a button which will redirect the user to the log creation page
 * @param {object} model Global model to access functions
 * @returns {vnode} A button which will redirect to creation of logs
 */
const addLogsButton = (model) => h('button.btn.btn-primary.w-15.h2.mlauto#create', {
    onclick: () => model.router.go('/?page=log-create'),
}, 'Add Log Entries');

export default (model) => logOverviewScreen(model);
