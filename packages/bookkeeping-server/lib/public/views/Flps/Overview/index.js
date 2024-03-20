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
import { flpsActiveColumns } from '../ActiveColumns/flpsActiveColumns.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';

/**
 * Table row header
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the table with the filtering options
 */
const flpOverview = (model) => {
    const data = model.flps.getFlps();

    return h('', { onremove: () => model.flps.clearFlps() }, [
        h('h2.mv2', 'Flp'),
        h('.flex-row.mv1', [
            h('.w-90', h('.w-100.flex-column.mh3', [
                table(data, flpsActiveColumns, {
                    callback: (entry) => ({
                        onclick: () => model.router.go(`?page=flp-detail&id=${entry.id}`, ''),
                    }),
                }),
                paginationComponent(model.flps.pagination),
            ])),
        ]),
    ]);
};

export default (model) => [flpOverview(model)];
