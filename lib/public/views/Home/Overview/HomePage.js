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
import { lhcFillsActiveColumns } from '../../LhcFills/ActiveColumns/lhcFillsActiveColumns.js';
import { table } from '../../../components/common/table/table.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';

// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const TABLEROW_HEIGHT = 90;
const PAGE_USED_HEIGHT = 300;
const MIN_ROWS = 4;

/**
 * Home Page component
 * @param {Object} model global model
 * @return {Component} Return the component of the home page
 */
export const HomePage = ({ home: { logsOverviewModel, runsOverviewModel, lhcFillsOverviewModel } }) => {
    const rowCount = Math.round(estimateDisplayableRowsCount(TABLEROW_HEIGHT, PAGE_USED_HEIGHT, MIN_ROWS));

    logsOverviewModel.pagination.provideDefaultItemsPerPage(rowCount);
    lhcFillsOverviewModel.pagination.provideDefaultItemsPerPage(rowCount);
    runsOverviewModel.pagination.provideDefaultItemsPerPage(rowCount);

    return (
        h('div', [
            h('.flex-row.w-100', [
                h('.flex-column.w-50', {
                    style: 'margin-right: 1rem;',
                }, [
                    h('h3', 'Log Entries'),
                    table(logsOverviewModel.logs, logsActiveColumns, null, { profile: 'home' }),
                ]),
                h('.flex-column.w-50', [
                    h('h3', 'LHC Fills'),
                    table(lhcFillsOverviewModel.items, lhcFillsActiveColumns, null, { profile: 'home' }),
                ]),
            ]),
            h('.flex-row.w-100.mv3', [
                h('.flex-column.w-100', [
                    h('h3', 'Runs'),
                    table(runsOverviewModel.runs, runsActiveColumns, null, { profile: 'home' }),
                ]),
            ]),
        ]));
};
