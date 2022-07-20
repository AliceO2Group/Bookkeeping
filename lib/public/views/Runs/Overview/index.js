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
import filtersRuns from '../../../components/Filters/RunsFilter/index.js';
import table from '../../../components/Table/index.js';
import { amountSelector, pageSelector } from '../../../components/Pagination/index.js';
import activeColumns from '../ActiveColumns/index.js';
import { exportRunsModal } from './exportRunsModal.js';

const AVAILABLE_AMOUNTS = [5, 10, 20];
const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const runsOverview = (model) => h('', {
    onremove: () => model.runs.clearRuns(),
}, showRunsTable(model, model.runs.getRuns()));

/**
 * Build components in case of runs retrieval success
 * @param {object} model model to access global functions
 * @param {Array<JSON>} runs list of runs retrieved from server
 * @return {vnode} Returns a vnode with the table containing the runs
 */
const showRunsTable = (model, runs) => {
    const runsColumns = activeColumns(model);

    if (!model.runs.getRowCountIsFixed()) {
        const runsPerPage = model.calculateRowDisplayAmount(TABLEROW_HEIGHT, PAGE_USED_HEIGHT);
        model.runs.setRunsPerPage(runsPerPage);
    }
    return [
        h('.flex-row.header-container.pv2', [
            filterRunsButton(model.runs),
            filterPanel(model, runsColumns),
            h(`.w-60.filters${model.runs.isAnyFilterActive()
            && !model.runs.getShowFilters() ? '.display-block' : '.display-none'}`, h('.f5'), `Active filters:
                ${model.runs.getActiveFilters().join(', ')}`),
            exportRunsButton(model),
        ]),
        h('.flex-column.w-100', [
            table(runs, runsColumns),
            pagination(model),
        ]),
    ];
};

/**
 * Build a button which operates the display of filters box
 * @param {Runs.js} runs to access Runs functions
 * @returns {vnode} vnode with button
 */
const filterRunsButton = (runs) =>
    h('button.btn.btn-primary', {
        onclick: () => {
            // eslint-disable-next-line no-undef
            window.clickedInFilters = true;
            runs.toggleShowFilters();
            setTimeout(() => {
                // eslint-disable-next-line no-undef
                window.clickedInFilters = false;
            }, 10);
        },
        id: 'openRunFilterToggle',
    }, `${runs.getShowFilters() ? 'Close' : 'Open'} filters`);

/**
 * Builds a panel containing possible filters for runs
 * @param {object} model global model to access functions
 * @param {JSON} runsColumns - JSON containing columns displayed and their properties
 * @returns {vnode} panel with filters for Runs table
 */
const filterPanel = (model, runsColumns) => h(`.w-25.filters${model.runs.getShowFilters() ? '.display-block' : '.display-none'}`, {
    onclick: () => {
        // eslint-disable-next-line no-undef
        window.clickedInFilters = true;
        setTimeout(() => {
            // eslint-disable-next-line no-undef
            window.clickedInFilters = false;
        }, 10);
    },
}, filtersRuns(model, runsColumns));

/**
 * Builds a button which will redirect the user to the export run page
 * @param {Model} model global model to access functions
 * @returns {vnode} with button
 */
const exportRunsButton = (model) =>
    h('button.btn.btn-primary.w-15.h2.mlauto#export-runs-trigger', {
        disabled: model.runs.runs.isSuccess() && model.runs.runs.payload.length === 0,
        onclick: () => model.modal({ content: (modalModel) => exportRunsModal(model, modalModel), size: 'medium' }),
    }, 'Export Runs');

/**
 * Build a panel which will allow the user to select which page should be displayed
 * @param {object} model global model to access functions
 * @returns {vnode} with pagination panel
 */
const pagination = (model) => {
    const amountDropdownVisible = model.runs.isAmountDropdownVisible();

    return h('.flex-row.justify-between.pv3', [
        h('.w-15', amountSelector(() => model.runs.toggleRunsDropdownVisible(), (amount) =>
            model.runs.setRunsPerPage(amount, true), amountDropdownVisible, AVAILABLE_AMOUNTS, model.runs.getRunsPerPage(), model.runs)),
        pageSelector((page) => model.runs.setSelectedPage(page), model.runs, model.runs.setRowCountFixed(true)),
        h('.w-15'),
    ]);
};

export default (model) => [runsOverview(model)];
