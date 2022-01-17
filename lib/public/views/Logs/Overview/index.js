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

let cachedPayload = null;

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const logOverviewScreen = (model) => {
    const data = model.logs.getLogs();
    const logsColumns = activeColumns(model);

    const amountDropdownVisible = model.logs.isAmountDropdownVisible();
    const logsPerPage = model.logs.getLogsPerPage();

    if (data.isSuccess()) {
        cachedPayload = data.payload;
    }

    const payload = data.isSuccess() ? data.payload : cachedPayload ? cachedPayload : [];

    return h('', { onremove: () => model.logs.clearLogs() }, [
        data.isLoading() && spinner(),
        data.isFailure() && data.payload.map(errorAlert),
        h('.flex-row.header-container', [
            h('h2.mv2', 'Log Entries'),
            h('button.btn.btn-primary.mt2.ml2', {
                onclick: () => {
                    // eslint-disable-next-line no-undef
                    window.clickedInFilters = true;
                    model.logs.toggleShowFilters();
                    setTimeout(() => {
                        // eslint-disable-next-line no-undef
                        window.clickedInFilters = false;
                    }, 10);
                },
                id: 'openFilterToggle',
            }, `${model.logs.getShowFilters() ? 'Close' : 'Open'} filters`),
            h(`.w-25.filters
            ${model.logs.getShowFilters() ? '.display-block' : '.display-none'}`, {
                onclick: () => {
                    // eslint-disable-next-line no-undef
                    window.clickedInFilters = true;
                    setTimeout(() => {
                        // eslint-disable-next-line no-undef
                        window.clickedInFilters = false;
                    }, 10);
                },
            }, filters(model, logsColumns)),
            h(`.w-50.filters${model.logs.isAnyFilterActive()
            && !model.logs.getShowFilters() ? '.display-block' : '.display-none'}`, h('.f5'), `Active filters:
            ${model.logs.getActiveFilters().join(', ')}`),
            h('button.btn.btn-primary.w-15.h2.mlauto#create', {
                onclick: () => model.router.go('/?page=log-create'),
            }, 'Add Log Entries'),
        ]),
        h('.flex-row.mv1', [
            h('.w-100', h('.w-100.flex-column.mh3', [
                table(payload, logsColumns, model, (_) => ({}), ''),
                h('.flex-row.justify-between.mv3', [
                    h('.w-15', amountSelector(() =>
                        model.logs.toggleLogsDropdownVisible(), (amount) => model.logs
                        .setLogsPerPage(amount), amountDropdownVisible, AVAILABLE_AMOUNTS, logsPerPage, model.logs)),
                    data.isSuccess()
                    && pageSelector((page) => model.logs.setSelectedPage(page), model.logs),
                    h('.w-15'),
                ]),
            ])),
        ]),
    ]);
};

export default (model) => [logOverviewScreen(model)];
