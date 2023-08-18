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
import { runsActiveColumns } from '../ActiveColumns/runsActiveColumns.js';
import { exportRunsModal } from './exportRunsModal.js';
import { filtersPanel } from '../../../components/Filters/common/filtersPanel.js';
import { filtersToggleButton } from '../../../components/Filters/common/filtersToggleButton.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';

const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Table row header
 * @param {Model} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const runsOverview = (model) => h('', showRunsTable(model, model.runs.getRuns()));

/**
 * Build components in case of runs retrieval success
 * @param {Model} model model to access global functions
 * @param {RemoteData<Run[]>} runs list of runs retrieved from server
 * @return {vnode[]} Returns a vnode with the table containing the runs
 */
const showRunsTable = (model, runs) => {
    model.runs.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    return [
        h('.flex-row.header-container.pv2', [
            filtersToggleButton(model.runs),
            filtersPanel(model, model.runs, runsActiveColumns),
            exportRunsButton(model),
        ]),
        h('.flex-column.w-100', [
            table(runs, runsActiveColumns),
            paginationComponent(model.runs.pagination),
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

export default (model) => runsOverview(model);
