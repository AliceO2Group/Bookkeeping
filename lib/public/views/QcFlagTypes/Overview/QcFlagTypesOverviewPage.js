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

import { h, iconPlus } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { qcFlagTypesActiveColumns } from '../ActiveColumns/qcFlagTypesActiveColumns.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

const TABLEROW_HEIGHT = 30;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render QC Flag Types overview page
 * @param {Model} model The overall model object.
 * @param {Model} [model.qcFlagTypes.overviewModel] model holding state for of the page
 * @return {Component} The overview page
 */
export const QcFlagTypesOverviewPage = (model) => {
    const { qcFlagTypes: { overviewModel } } = model;
    overviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const { items: qcFlagTypes } = overviewModel;

    return h('', [
        h('.flex-row.justify-between.items-center.g2', [
            h('.flex-row.items-center.g2', [
                filtersPanelPopover(overviewModel, qcFlagTypesActiveColumns),
                h('h2', { style: 'white-space: nowrap;' }, 'QC Flag Types'),
            ]),
            model.isAdmin() && [
                frontLink(h('.flex-row.items-center.g1', [h('small', iconPlus()), 'QC Flag Type']), 'qc-flag-type-creation', {}, {
                    class: 'btn btn-primary',
                    title: 'Create a new QC Flag Type',
                }),
            ],
        ]),
        h('.flex-column.w-100', [
            table(
                qcFlagTypes,
                qcFlagTypesActiveColumns,
                { classes: '.table-sm' },
                null,
                { sort: overviewModel.sortModel },
            ),
            paginationComponent(overviewModel.pagination),
        ]),
    ]);
};
