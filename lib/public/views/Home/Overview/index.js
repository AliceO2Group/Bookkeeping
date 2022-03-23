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
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';

const TABLEROW_HEIGHT = 46;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 155;

/**
 * Home Page main components
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the page with the filtering options
 */
const HomeOverviewScreen = (model) => {
    const rowCount = model.calculateRowDisplayAmount(TABLEROW_HEIGHT, PAGE_USED_HEIGHT);

    model.logs.setLogsPerPage(rowCount);
    const logs = model.logs.getLogs();
    const logsColumns = activeLogsColumns(model);

    const runs = model.runs.getRuns();
    const runsColumns = activeRunsColumns(model);
    model.runs.setRunsPerPage(rowCount);

    return h('.flex-row.w-100', [
        h('.flex-column.w-50', {
            style: 'padding-right: 1rem;',
        }, [
            h('h2', 'Log Entries'),
            logs.match({
                NotAsked: () => null,
                Loading: () => spinner({ size: 5, absolute: false }),
                Success: (logsPayload) => h('.w-100.flex-column', table(logsPayload, logsColumns, model, (_) => ({ }), '')),
                Failure: (error) => errorAlert(error),
            }),
        ]),
        h('.flex-column.w-50', [
            h('h2', 'Runs'),
            runs.match({
                NotAsked: () => null,
                Loading: () => spinner({ size: 5, absolute: false }),
                Success: (runsPayload) => h('.w-100.flex-column', table(runsPayload, runsColumns, model, (_) => ({ }), '')),
                Failure: (error) => errorAlert(error),
            }),
        ]),
    ]);
};

export default (model) => [HomeOverviewScreen(model)];
