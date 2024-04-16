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

import { h, iconWarning, iconPlus } from '/js/src/index.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { breadcrumbs } from '../../../components/common/navigation/breadcrumbs.js';
import spinner from '../../../components/common/spinner.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { qcFlagsActiveColumns } from '../ActiveColumns/qcFlagsActiveColumns.js';

const TABLEROW_HEIGHT = 35;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Quality Control Flags For Data Pass Overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview page
 */
export const QcFlagsForDataPassOverviewPage = ({ qcFlags: { forDataPassOverviewModel: qcFlagsForDataPassOverviewModel } }) => {
    const {
        run: remoteRun,
        dplDetector: remoteDplDetector,
        dataPass: remoteDataPass,
        runNumber,
        dataPassId,
        dplDetectorId,
    } = qcFlagsForDataPassOverviewModel;

    qcFlagsForDataPassOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const activeColumns = {
        id: {
            name: 'Id',
            visible: true,
            format: (id, { dataPassId, dplDetectorId, runNumber }) =>
                frontLink(id, 'qc-flag-details-for-data-pass', { id, dataPassId, runNumber, dplDetectorId }),
            classes: 'w-5',
        },
        ...qcFlagsActiveColumns,
    };

    const {
        items: qcFlags,
        sortModel,
        pagination: paginationModel,
    } = qcFlagsForDataPassOverviewModel;

    const commonTitle = h('h2', 'QC');
    return h('', {
        onremove: () => qcFlagsForDataPassOverviewModel.reset(),
    }, [
        h('.flex-row.justify-between.items-center', [
            h('.flex-row.g1.items-center', [
                remoteDataPass.match({
                    Success: (dataPass) => remoteRun.match({
                        Success: (run) => remoteDplDetector.match({
                            Success: (dplDetector) => breadcrumbs([
                                commonTitle,
                                h('h2', frontLink(dataPass.name, 'runs-per-data-pass', { dataPassId: dataPass.id })),
                                h('h2', frontLink(run.runNumber, 'run-detail', { runNumber: run.runNumber })),
                                h('h2', dplDetector.name),
                            ]),
                            Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to load detector info')],
                            Loading: () => [commonTitle, h('', spinner({ size: 2, absolute: false }))],
                            NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No detector data was asked for')],
                        }),
                        Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to load run info')],
                        Loading: () => [commonTitle, h('', spinner({ size: 2, absolute: false }))],
                        NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No run data was asked for')],
                    }),
                    Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to load data pass info')],
                    Loading: () => [commonTitle, h('', spinner({ size: 2, absolute: false }))],
                    NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No data pass data was asked for')],
                }),
            ]),
            frontLink(h('.flex-row.items-center.g1', [h('small', iconPlus()), 'QC']), 'qc-flag-creation-for-data-pass', {
                runNumber,
                dataPassId,
                dplDetectorId,
            }, {
                class: 'btn btn-primary',
                title: 'Create a QC flag',
            }),
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
    ]);
};
