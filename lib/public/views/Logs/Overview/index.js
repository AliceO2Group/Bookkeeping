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
import { table } from '../../../components/Table/index.js';
import ACTIVE_COLUMNS from '../ActiveColumns/index.js';

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const logOverviewScreen = (model) => {
    const data = model.logs.getData();
    const tags = model.logs.getTagCounts();

    return h('', [
        h('.w-100.flex-row', [
            filters(model, tags),
            h('.w-75', table(data, ACTIVE_COLUMNS, (entry) => ({
                style: 'cursor: pointer;',
                onclick: () => model.router.go(`?page=entry&id=${entry.id}`),
            }))),
        ]),
        h('button.btn.btn-primary.m2.btn-right#create', {
            onclick: () => model.router.go('/?page=create-log-entry'),
        }, 'Add Entry'),
    ]);
};

export default (model) => [logOverviewScreen(model)];
