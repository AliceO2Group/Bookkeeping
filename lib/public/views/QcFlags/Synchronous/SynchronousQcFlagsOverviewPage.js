/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { qcFlagsActiveColumns } from '../ActiveColumns/qcFlagsActiveColumns.js';
import { qcFlagsBreadcrumbs } from '../../../components/qcFlags/qcFlagsBreadcrumbs.js';

const TABLEROW_HEIGHT = 35;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Synchronous Quality Control Flags Overview page
 *
 * @param {Model} model The overall model object.
 * @returns {Component} The overview page
 */
export const SynchronousQcFlagsOverviewPage = ({ qcFlags: { synchronousOverviewModel } }) => {
    const {
        items: qcFlags,
        sortModel,
        pagination: paginationModel,

        dplDetector: remoteDplDetector,
        run: remoteRun,
    } = synchronousOverviewModel;

    synchronousOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const activeColumns = {
        qcFlagId: {
            name: 'Id',
            visible: false,
            classes: 'w-5',
        },
        ...qcFlagsActiveColumns,
    };
    delete activeColumns.verified;

    return h(
        '',
        { onremove: () => synchronousOverviewModel.reset() },
        [
            h('.flex-row.justify-between.items-center', [qcFlagsBreadcrumbs({ remoteRun, remoteDplDetector }, 'Sync QC')]),
            h('.w-100.flex-column', [
                table(
                    qcFlags,
                    activeColumns,
                    { classes: '.table-sm' },
                    null,
                    { sort: sortModel },
                ),
                paginationComponent(paginationModel),
            ]),
        ],
    );
};
