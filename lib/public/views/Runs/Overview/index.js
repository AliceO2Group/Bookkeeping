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
import { table } from '../../../components/common/table/table.js';
import { amountSelector, pageSelector } from '../../../components/Pagination/index.js';
import { runsActiveColumns } from '../ActiveColumns/runsActiveColumns.js';
import { exportRunsModal } from './exportRunsModal.js';
import { filtersPanel } from '../../../components/Filters/common/filtersPanel.js';
import { filtersToggleButton } from '../../../components/Filters/common/filtersToggleButton.js';

const AVAILABLE_AMOUNTS = [5, 10, 20];
const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Table row header
 * @param {Model} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const runsOverview = (model) => h('', {
    onremove: () => model.runs.clearRuns(),
}, showRunsTable(model, model.runs.getRuns()));

/**
 * Build components in case of runs retrieval success
 * @param {Model} model model to access global functions
 * @param {Array<JSON>} runs list of runs retrieved from server
 * @return {vnode[]} Returns a vnode with the table containing the runs
 */
const showRunsTable = (model, runs) => {
    if (!model.runs.getRowCountIsFixed()) {
        const runsPerPage = model.calculateRowDisplayAmount(TABLEROW_HEIGHT, PAGE_USED_HEIGHT);
        model.runs.setRunsPerPage(runsPerPage);
    }
    return [
        h('.flex-row.header-container.pv2', [
            filtersToggleButton(model.runs),
            filtersPanel(model, model.runs, runsActiveColumns),
            h(`.w-60.filters${model.runs.isAnyFilterActive()
                              && !model.runs.areFiltersVisible ? '.display-block' : '.display-none'}`, h('.f5'), `Active filters:
                ${model.runs.getActiveFilters().join(', ')}`),
            exportRunsButton(model),
        ]),
        h('.flex-column.w-100', [
            table(runs, runsActiveColumns),
            pagination(model),
        ]),
    ];
};

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
 * @param {Model} model global model to access functions
 * @returns {vnode} with pagination panel
 */
const pagination = (model) => {
    const amountDropdownVisible = model.runs.isAmountDropdownVisible();

    model.runs.setRowCountFixed(true);

    return h('.flex-row.justify-between.pv3', [
        h('.w-15', amountSelector(
            () => model.runs.toggleRunsDropdownVisible(),
            (amount) => model.runs.setRunsPerPage(amount, true),
            amountDropdownVisible,
            AVAILABLE_AMOUNTS,
            model.runs.getRunsPerPage(),
            model.runs,
        )),
        pageSelector((page) => model.runs.setSelectedPage(page), model.runs),
        h('.w-15'),
    ]);
};

export default (model) => [runsOverview(model)];
