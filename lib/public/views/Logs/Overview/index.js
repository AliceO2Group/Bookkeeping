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
import pageSelector from '../../../components/PageSelector/index.js';
import ACTIVE_COLUMNS from '../ActiveColumns/index.js';

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const logOverviewScreen = (model) => {
    const data = model.logs.getData();
    const tags = model.logs.getTagCounts();
    const totalPages = model.logs.getTotalPages();
    const selectedPage = model.logs.getSelectedPage();

    if (Array.isArray(data) && data.length > 0) {
        return h('.flex-row', [
            filters(model, tags),
            h('.flex-column.mh3.w-100', [
                table(data, ACTIVE_COLUMNS, (entry) => ({
                    style: 'cursor: pointer;',
                    onclick: () => model.router.go(`?page=entry&id=${entry.id}`),
                })),
                h('.flex-row.justify-between.mv3', [
                    h(''),
                    pageSelector(totalPages, selectedPage, (page) => model.logs.setSelectedPage(page)),
                    h('button.btn.btn-primary#create', {
                        onclick: () => model.router.go('/?page=create-log-entry'),
                    }, 'Add Entry'),
                ]),
            ]),
        ]);
    } else {
        return spinner();
    }
};

export default (model) => [logOverviewScreen(model)];
