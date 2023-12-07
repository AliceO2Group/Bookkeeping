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
import { logsActiveColumns } from '../../Logs/ActiveColumns/logsActiveColumns.js';
import { runsActiveColumns } from '../../Runs/ActiveColumns/runsActiveColumns.js';
import { table } from '../../../components/common/table/table.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';

const TABLEROW_HEIGHT = 46;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 155;

/**
 * Home Page main components
 * @param {Object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the page with the filtering options
 */
const HomeOverviewScreen = (model) => {
    const rowCount = estimateDisplayableRowsCount(TABLEROW_HEIGHT, PAGE_USED_HEIGHT);
    model.logs.pagination.provideDefaultItemsPerPage(rowCount);
    model.runs.pagination.provideDefaultItemsPerPage(rowCount);

    const logs = model.logs.getLogs();
    const runs = model.runs.getRuns();

    return h('.flex-row.w-100', [
        h('.flex-column.w-50', {
            style: 'padding-right: 1rem;',
        }, [
            h('h2', 'Log Entries'),
            table(logs, logsActiveColumns, null, { profile: 'home' }),
        ]),
        h('.flex-column.w-50', [
            h('h2', 'Runs'),
            table(runs, runsActiveColumns, null, { profile: 'home' }),
        ]),
    ]);
};

export default (model) => [HomeOverviewScreen(model)];
