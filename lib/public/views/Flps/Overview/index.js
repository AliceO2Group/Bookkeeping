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
import filters from '../../../components/Filters/FlpsFilter/index.js';
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
const flpOverview = (model) => {
    const data = model.flps.getFlps();
    const flpsColumns = activeColumns();

    const amountDropdownVisible = model.flps.isAmountDropdownVisible();
    const flpsPerPage = model.flps.getFlpsPerPage();
    const totalPages = model.flps.getTotalPages();
    const selectedPage = model.flps.getSelectedPage();

    return h('', { onremove: () => model.flps.clearFlps() }, [
        data.isLoading() && spinner(),
        data.isFailure() && data.payload.map(errorAlert),
        h('h2.mv2', 'Flp'),
        h('.flex-row.mv1', [
            h('.w-10', filters(model, flpsColumns)),
            h('.w-90', data.isSuccess() && h('.w-100.flex-column.mh3', [
                table(data.isSuccess() ? data.payload : [], flpsColumns, model, (entry) => ({
                    onclick: () => model.router.go(`?page=flp&id=${entry.id}`),
                })),
                h('.flex-row.justify-between.mv3', [
                    h('.w-15', amountSelector(() =>
                        model.flps.toggleFlpsDropdownVisible(), (amount) => model.flps
                        .setFlpsPerPage(amount), amountDropdownVisible, AVAILABLE_AMOUNTS, flpsPerPage, model.flps)),
                    pageSelector(totalPages, selectedPage, (page) => model.flps.setSelectedPage(page)),
                    h('.w-15'),
                ]),
            ])),
        ]),
    ]);
};

export default (model) => [flpOverview(model)];
