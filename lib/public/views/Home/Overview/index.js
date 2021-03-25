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
import { activeHomeOverviewColumns as activeLogsColumns } from '../../Logs/ActiveColumns/index.js';
import { activeHomeOverviewColumns as activeRunsColumns } from '../../Runs/ActiveColumns/index.js';
import table from '../../../components/Table/index.js';

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

    return h('', [
        h('.flex-row.w-100', [
            
            h('.flex-column.w-50', [
                h('h1', 'Log Entries'),
                h('.w-90', logs.isSuccess() && h('.w-100.flex-column.mh3', [
                    table(logs.isSuccess() ? logs.payload : [], logsColumns, model, (entry) => ({
                        onclick: () => model.router.go(`?page=log-detail&id=${entry.id}`),
                    }), 'home'),
                ])),
            ]),
            
            h('.flex-column.w-50', [
                h('h1', 'Runs'),
                h('.w-90', runs.isSuccess() && h('.w-100.flex-column.mh3', [
                    table(runs.isSuccess() ? runs.payload : [], runsColumns, model, (entry) => ({
                        onclick: () => model.router.go(`?page=run-detail&id=${entry.id}`),
                    }), 'home'),
                ])),
            ]),
        ]),
        h('.flex-row.justify-between.items-center', [
            h('button.btn.btn-primary', {
                onclick: () => model.router.go('/?page=about-overview'),
            }, 'For additional information'),
            ])
    ]);
};

export default (model) => [HomeOverviewScreen(model)];
