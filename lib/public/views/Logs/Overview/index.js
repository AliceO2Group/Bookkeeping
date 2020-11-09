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
import filters from '../../../components/Filters/LogsFilter/index.js';
import table from '../../../components/Table/index.js';
import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';
import { amountSelector, pageSelector } from '../../../components/Pagination/index.js';
import activeColumns from '../ActiveColumns/index.js';

const AVAILABLE_AMOUNTS = [5, 10, 20];

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const logOverviewScreen = (model) => {
    const data = model.logs.getLogs();
    const logsColumns = activeColumns(model);

    logsColumns.title.size = 'cell-f';
    logsColumns.author.size = 'cell-fm';
    logsColumns.createdAt.size = 'cell-fm';
    logsColumns.tags.size = 'cell-fm';

    const amountDropdownVisible = model.logs.isAmountDropdownVisible();
    const logsPerPage = model.logs.getLogsPerPage();
    const totalPages = model.logs.getTotalPages();
    const selectedPage = model.logs.getSelectedPage();
    const filtersVisible = false;

    return h('', { onremove: () => model.logs.clearLogs() }, [
        data.isLoading() && spinner(),
        data.isFailure() && data.payload.map(errorAlert),
        h('.flex-row.justify-between.items-center', [
            h('h2.mv2', 'Logs'),
            h('button.btn.btn-primary.mt2', {
                onclick: () => !filtersVisible,
            }, 'Open/Close'),
            h(`.w-70${filtersVisible ? '.display-none' : '.display-block' }`, filters(model, logsColumns)),
            h('button.btn.btn-primary.w-15.h2#create', {
                onclick: () => model.router.go('/?page=log-create'),
            }, 'Create Log'),
        ]),
        h('.flex-row.mv1', [
            h('.w-100', data.isSuccess() && h('.w-100.flex-column.mh3', [
                table(data.isSuccess() ? data.payload : [], logsColumns, model, (entry) => ({
                    onclick: () => model.router.go(`?page=log-detail&id=${entry.id}`),
                })),
                h('.flex-row.justify-between.mv3', [
                    h('.w-15', amountSelector(() =>
                        model.logs.toggleLogsDropdownVisible(), (amount) =>
                        model.logs.setLogsPerPage(amount), amountDropdownVisible, AVAILABLE_AMOUNTS, logsPerPage)),
                    pageSelector(totalPages, selectedPage, (page) => model.logs.setSelectedPage(page)),
                    h('.w-15'),
                ]),
            ])),
        ]),
    ]);
};

export default (model) => [logOverviewScreen(model)];
