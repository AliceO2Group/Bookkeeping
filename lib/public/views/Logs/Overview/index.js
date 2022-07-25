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
import { amountSelector, pageSelector } from '../../../components/Pagination/index.js';
import { logsActiveColumns } from '../ActiveColumns/logsActiveColumns.js';

const AVAILABLE_AMOUNTS = [5, 10, 20];
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
    return h('', {
        onremove: () => model.logs.clearLogs(),
    }, showLogsTable(model, data));
};

/**
 * Build components in case of logs retrieval success
 * @param {Model} model model to access global functions
 * @param {RemoteData} logs list of logs retrieved from server
 * @return {vnode} Returns a vnode with the table containing the logs
 */
const showLogsTable = (model, logs) => {
    if (!model.logs.getRowCountIsFixed()) {
        // Calculates the number of rows which should be visible on the page
        const logsPerPage = model.calculateRowDisplayAmount(TABLEROW_HEIGHT, PAGE_USED_HEIGHT);
        model.logs.setLogsPerPage(logsPerPage);
    }

    return [
        h('.flex-row.header-container.pv2', [
            filterLogsButton(model.logs),
            filterPanel(model, logsActiveColumns),
            h(`.w-50.filters${model.logs.isAnyFilterActive()
            && !model.logs.getShowFilters() ? '.display-block' : '.display-none'}`, h('.f5'), `Active filters:
            ${model.logs.getActiveFilters().join(', ')}`),
            addLogsButton(model),
        ]),
        h('.w-100.flex-column', [
            table(logs, logsActiveColumns, { sortModel: model.logs.overviewSortModel }),
            pagination(model),
        ]),
    ];
};

/**
 * Build a button which operates the display of filters box
 * @param {LogModel} logs Model to access Logs functions
 * @returns {vnode} Returns a button
 */
const filterLogsButton = (logs) =>
    h('button.btn.btn-primary', {
        onclick: () => {
            // eslint-disable-next-line no-undef
            window.clickedInFilters = true;
            logs.toggleShowFilters();
            setTimeout(() => {
                // eslint-disable-next-line no-undef
                window.clickedInFilters = false;
            }, 10);
        },
        id: 'openFilterToggle',
    }, `${logs.getShowFilters() ? 'Close' : 'Open'} filters`);

/**
 * Builds a panel containing possible filters for logs
 * @param {Model} model Global model to access functions
 * @param {object} logsColumns - JSON containing columns displayed and their properties
 * @returns {vnode} A panel with filters
 */
const filterPanel = (model, logsColumns) =>
    h(`.w-25.filters${model.logs.getShowFilters() ? '.display-block' : '.display-none'}`, {
        onclick: () => {
            // eslint-disable-next-line no-undef
            window.clickedInFilters = true;
            setTimeout(() => {
                // eslint-disable-next-line no-undef
                window.clickedInFilters = false;
            }, 10);
        },
    }, filters(model, logsColumns));

/**
 * Builds a button which will redirect the user to the log creation page
 * @param {object} model Global model to access functions
 * @returns {vnode} A button which will redirect to creation of logs
 */
const addLogsButton = (model) =>
    h('button.btn.btn-primary.w-15.h2.mlauto#create', {
        onclick: () => model.router.go('/?page=log-create'),
    }, 'Add Log Entries');

/**
 * Build a panel which will allow the user to select which page should be displayed
 * @param {object} model Global model to access functions
 * @returns {vnode} A panel with buttons to change pages within log table
 */
const pagination = (model) => {
    const amountDropdownVisible = model.logs.isAmountDropdownVisible();
    return h('.flex-row.justify-between.pv3', [
        h('.w-15', amountSelector(() =>
            model.logs.toggleLogsDropdownVisible(), (amount) =>
            model.logs.setLogsPerPage(amount), amountDropdownVisible, AVAILABLE_AMOUNTS, model.logs.getLogsPerPage(), model.logs)),
        pageSelector((page) => model.logs.setSelectedPage(page), model.logs, model.logs.setRowCountFixed(true)),
        h('.w-15'),
    ]);
};

export default (model) => logOverviewScreen(model);
