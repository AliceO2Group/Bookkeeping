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
import filters from '../../../components/Filters/RunsFilter/index.js';
import table from '../../../components/Table/index.js';
import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';
import { amountSelector, pageSelector } from '../../../components/Pagination/index.js';
import activeColumns from '../ActiveColumns/index.js';

const AVAILABLE_AMOUNTS = [5, 10, 20];

let cachedPayload = null;

/**
 * Checks whether the element given is of type boolean.
 * @param {Object} value Element to be checked.
 * @returns {Boolean} Whether element is boolean or not.
 */
const isBoolean = (value) => typeof value === 'boolean';

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const runsOverview = (model) => {
    const data = model.runs.getRuns();
    const runsColumns = activeColumns();

    const amountDropdownVisible = model.runs.isAmountDropdownVisible();
    const runsPerPage = model.runs.getRunsPerPage();

    if (data.isSuccess()) {
        cachedPayload = data.payload;
    }

    const payload = data.isSuccess() ? data.payload : cachedPayload ? cachedPayload : [];

    return h('', { onremove: () => model.runs.clearRuns() }, [
        data.isLoading() && spinner(),
        data.isFailure() && data.payload.map(errorAlert),
        h('.flex-row.justify-between.items-center', [
            h('h2.mv2', 'Runs'),
            h('button.btn.btn-primary.w-15.h2#create', {
                onclick: () => model.router.go('/?page=run-export'),
            }, 'Export Runs'),
        ]),
        h('.flex-row.mv1', [
            h('.w-10', filters(model, runsColumns)),
            h('.w-90', h('.w-100.flex-column.mh3', [
                table(payload, runsColumns, model, (entry) => ({
                    onclick: () => model.router.go(`?page=run-detail&id=${entry.id}`),
                })),
                h('.flex-row.justify-between.mv3', [
                    h('.w-15', amountSelector(() =>
                        model.runs.toggleRunsDropdownVisible(), (amount) => model.runs
                        .setRunsPerPage(amount), amountDropdownVisible, AVAILABLE_AMOUNTS, runsPerPage, model.runs)),
                    data.isSuccess()
                    && pageSelector((page) => model.runs.setSelectedPage(page), model.runs),
                    h('.w-15'),
                ]),
            ])),
        ]),
    ]);
};

export default (model) => [runsOverview(model)];
