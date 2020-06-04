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
import filters from '../../../components/Filters/index.js';
import table from '../../../components/Table/index.js';
import spinner from '../../../components/common/spinner.js';
import { amountSelector, pageSelector } from '../../../components/Pagination/index.js';
import ACTIVE_COLUMNS from '../ActiveColumns/index.js';

const AVAILABLE_AMOUNTS = [5, 10, 20];

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const logOverviewScreen = (model) => {
    const data = model.logs.getLogs();

    if (!data.isLoading()) {
        const tags = data.isSuccess() && model.logs.getTagCounts();

        const amountDropdownVisible = model.logs.isAmountDropdownVisible();
        const logsPerPage = model.logs.getLogsPerPage();
        const totalPages = model.logs.getTotalPages();
        const selectedPage = model.logs.getSelectedPage();

        return h('', [
            data.isFailure() && data.payload.map((error) =>
                h('.alert.alert-danger', h('b', `${error.title}: `), error.detail)),
            h('.flex-row', [
                filters(model, tags),
                h('.flex-column.mh3.w-100', [
                    table(data.isSuccess() ? data.payload : [], ACTIVE_COLUMNS, (entry) => ({
                        style: 'cursor: pointer;',
                        onclick: () => model.router.go(`?page=entry&id=${entry.id}`),
                    })),
                    h('.flex-row.justify-between.mv3', [
                        h('.w-15', amountSelector(() =>
                            model.logs.toggleLogsDropdownVisible(), (amount) =>
                            model.logs.setLogsPerPage(amount), amountDropdownVisible, AVAILABLE_AMOUNTS, logsPerPage)),
                        pageSelector(totalPages, selectedPage, (page) => model.logs.setSelectedPage(page)),
                        h('button.btn.btn-primary.w-15#create', {
                            onclick: () => model.router.go('/?page=create-log-entry'),
                        }, 'Add Entry'),
                    ]),
                ]),
            ]),
        ]);
    } else {
        return spinner();
    }
};

export default (model) => [logOverviewScreen(model)];
