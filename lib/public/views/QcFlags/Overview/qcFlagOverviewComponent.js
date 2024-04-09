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

import { h, iconWarning } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { qcFlagsActiveColumns } from '../ActiveColumns/qcFlagsActiveColumns.js';
import spinner from '../../../components/common/spinner.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { breadcrumbs } from '../../../components/common/navigation/breadcrumbs.js';

const TABLEROW_HEIGHT = 35;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Quality Control Flags Overview page
 * @param {QcFlagsOverviewModel} qcFlagsModel The overall model object.
 * @param {object} [configuration] additional componenet configuration
 * @param {function<DataPass|SimulationPass, Componenet>} [configuration.productionLinkFactory] factory creating
 * in-breadcrumbs link related to given production
 * @returns {Component} The overview page
 */
export const QcFlagsOverviewComponenet = (qcFlagsModel, configuration) => {
    qcFlagsModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const { productionLinkFactory } = configuration;

    const {
        items: qcFlags,
        run: remoteRun,
        dataProducation: remoteDataProduction,
        dplDetector: remoteDplDetector,
    } = qcFlagsModel;

    const commonTitle = h('h2', 'QC');
    return h('', {
        onremove: () => qcFlagsModel.reset(),
    }, [
        h('.flex-row.justify-between.items-center', [
            h('.flex-row.g1.items-center', [
                remoteDataProduction.match({
                    Success: (dataProduction) => remoteRun.match({
                        Success: (run) => remoteDplDetector.match({
                            Success: (dplDetector) => breadcrumbs([
                                commonTitle,
                                productionLinkFactory ? productionLinkFactory(dataProduction) : dataProduction.name,
                                h('h2', frontLink(run.runNumber, 'run-detail', { runNumber: run.runNumber })),
                                h('h2', dplDetector?.name),
                            ]),
                            Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to load detector info')],
                            Loading: () => [commonTitle, h('', spinner({ size: 2, absolute: false }))],
                            NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No data was asked for')],
                        }),
                        Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to load run info')],
                        Loading: () => [commonTitle, h('', spinner({ size: 2, absolute: false }))],
                        NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No data was asked for')],
                    }),
                    Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to load data pass info')],
                    Loading: () => [commonTitle, h('', spinner({ size: 2, absolute: false }))],
                    NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No data was asked for')],
                }),
            ]),
        ]),
        h('.w-100.flex-column', [
            table(
                qcFlags,
                qcFlagsActiveColumns,
                { classes: '.table-sm' },
                null,
                null,
            ),
            paginationComponent(qcFlagsModel.pagination),
        ]),
    ]);
};
