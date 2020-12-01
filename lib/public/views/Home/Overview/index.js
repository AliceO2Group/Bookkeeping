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
import { LogTable } from '../../Logs/Overview/index.js';
import { RunsTable } from '../../Runs/Overview/index.js';
import { activeHomeOverviewColumns as activeLogsColumns } from '../../Logs/ActiveColumns/index.js';
import { activeHomeOverviewColumns as activeRunsColumns } from '../../Runs/ActiveColumns/index.js';

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const HomeOverviewScreen = (model) => {
    const logs = model.logs.getLogs();
    const logsColumns = activeLogsColumns(model);
    const runs = model.runs.getRuns();
    const runsColumns = activeRunsColumns(model);

    logsColumns.title.size = 'cell-f';
    logsColumns.createdAt.size = 'cell-fm';

    model.logs.setLogsPerPage(5);
    model.runs.setRunsPerPage(5);

    return h('', [
        h('.flex-row.w-100', [
            h('.flex-column.w-50', [
                h('h1', 'Logs'),
                LogTable(model, logs, logsColumns, {logsPerPage: 5, amountDropdownVisible: false, pageSelectorVisible: false}),
            ]),
            h('.flex-column.w-50', [
                h('h1', 'Runs'),
                RunsTable(model, runs, runsColumns, {runsPerPage: 5, amountDropdownVisible: false, pageSelectorVisible: false}),
            ]),
        ]),
    ]);
};


export default (model) => [HomeOverviewScreen(model)];
