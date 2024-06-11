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
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { qcFlagsActiveColumns } from '../ActiveColumns/qcFlagsActiveColumns.js';
import { qcFlagCreationPanelLink } from '../../../components/qcFlags/qcFlagsPagesButtons.js';
import { qcFlagsBreadcrumbs } from '../../../components/qcFlags/qcFlagsBreadcrumbs.js';

const TABLEROW_HEIGHT = 35;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Quality Control Flags For Data Pass Overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview page
 */
export const QcFlagsForDataPassOverviewPage = ({
    qcFlags: { forDataPassOverviewModel: qcFlagsForDataPassOverviewModel },
    dplDetectorsUserHasAccessTo: remoteDplDetectorsUserHasAccessTo,
}) => {
    const {
        dplDetector: remoteDplDetector,
        dataPass: remoteDataPass,
        run: remoteRun,
        dataPassId,
        dplDetectorId,
    } = qcFlagsForDataPassOverviewModel;

    qcFlagsForDataPassOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const activeColumns = {
        qcFlagId: {
            name: 'Id',
            visible: true,
            format: (qcFlagId, { dataPassId, dplDetectorId, runNumber }) =>
                frontLink(
                    h('.btn.btn-primary.white', qcFlagId),
                    'qc-flag-details-for-data-pass',
                    { id: qcFlagId, dataPassId, runNumber, dplDetectorId },
                ),
            classes: 'w-5',
        },
        ...qcFlagsActiveColumns,
    };

    const {
        items: qcFlags,
        sortModel,
        pagination: paginationModel,
    } = qcFlagsForDataPassOverviewModel;

    return h(
        '',
        { onremove: () => qcFlagsForDataPassOverviewModel.reset() },
        [
            h('.flex-row.justify-between.items-center', [
                qcFlagsBreadcrumbs({ remoteDataPass, remoteRun, remoteDplDetector }),
                qcFlagCreationPanelLink({ dataPassId }, remoteRun, dplDetectorId, remoteDplDetectorsUserHasAccessTo),
            ]),
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
