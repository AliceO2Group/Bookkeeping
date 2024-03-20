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

import { h } from '@aliceo2/web-ui/Frontend/js/src/index.js';
import { logsActiveColumns } from '../../Logs/ActiveColumns/logsActiveColumns.js';
import { runsActiveColumns } from '../../Runs/ActiveColumns/runsActiveColumns.js';
import { lhcFillsActiveColumns } from '../../LhcFills/ActiveColumns/lhcFillsActiveColumns.js';
import { table } from '../../../components/common/table/table.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';

// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const TABLEROW_HEIGHT = 46;
const PAGE_USED_HEIGHT = 240;
const MIN_ROWS = 5;

/**
 * Home Page component
 * @param {Object} model global model
 * @return {Component} Return the component of the home page
 */
export const HomePage = ({ home: { logsOverviewModel, runsOverviewModel, lhcFillsOverviewModel } }) => {
    // Total rows that fits on the page
    const rowCount = Math.round(estimateDisplayableRowsCount(TABLEROW_HEIGHT, PAGE_USED_HEIGHT, MIN_ROWS));
    const topRowsCount = Math.ceil(rowCount / 2);

    logsOverviewModel.pagination.provideDefaultItemsPerPage(topRowsCount);
    lhcFillsOverviewModel.pagination.provideDefaultItemsPerPage(topRowsCount);
    runsOverviewModel.pagination.provideDefaultItemsPerPage(rowCount - topRowsCount);

    return (
        h('div.flex-column.g2', [
            h('.flex-row.g2', [
                h('.flex-column', [
                    h('h3', 'Log Entries'),
                    h('.f6', table(logsOverviewModel.logs, logsActiveColumns, null, { profile: 'home' })),
                ]),
                h('.flex-column', [
                    h('h3', 'LHC Fills'),
                    h('.f6', table(lhcFillsOverviewModel.items, lhcFillsActiveColumns, null, { profile: 'home' })),
                ]),
            ]),
            h('.flex-row', [
                h('.flex-column', [
                    h('h3', 'Runs'),
                    table(runsOverviewModel.items, runsActiveColumns, null, { profile: 'home' }),
                ]),
            ]),
        ]));
};
