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
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { breadcrumbs } from '../../../components/common/navigation/breadcrumbs.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import spinner from '../../../components/common/spinner.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { qcFlagsActiveColumns } from '../ActiveColumns/qcFlagsActiveColumns.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { qcFlagCreationPanelLink } from '../../../components/qcFlags/qcFlagsPagesButtons.js';

const TABLEROW_HEIGHT = 35;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Quality Control Flags For Simulation Pass Overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview page
 */
export const QcFlagsForSimulationPassOverviewPage = ({
    qcFlags: { forSimulationPassOverviewModel: qcFlagsForSimulationPassOverviewModel },
    usersDplDetectors: remoteUsersDplDetectors,
}) => {
    const {
        dplDetector: remoteDplDetector,
        simulationPass: remoteSimulationPass,
        runNumber,
        simulationPassId,
        dplDetectorId,
    } = qcFlagsForSimulationPassOverviewModel;

    qcFlagsForSimulationPassOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const activeColumns = {
        qcFlagId: {
            name: 'Id',
            visible: true,
            format: (qcFlagId, { simulationPassId, dplDetectorId, runNumber }) =>
                frontLink(
                    h('.btn.btn-primary.white', qcFlagId),
                    'qc-flag-details-for-simulation-pass',
                    { id: qcFlagId, simulationPassId, runNumber, dplDetectorId },
                ),
            classes: 'w-5',
        },
        ...qcFlagsActiveColumns,
    };

    const {
        items: qcFlags,
        sortModel,
        pagination: paginationModel,
    } = qcFlagsForSimulationPassOverviewModel;

    const commonTitle = h('h2', 'QC');
    return h(
        '',
        { onremove: () => qcFlagsForSimulationPassOverviewModel.reset() },
        [
            h('.flex-row.justify-between.items-center', [
                h('.flex-row.g1.items-center', breadcrumbs([
                    commonTitle,
                    remoteSimulationPass.match({
                        Success: (simulationPass) => h(
                            'h2',
                            frontLink(simulationPass.name, 'runs-per-simulation-pass', { simulationPassId }),
                        ),
                        Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load simulation pass info'),
                        Loading: () => h('', spinner({ size: 2, absolute: false })),
                        NotAsked: () => tooltip(h('.f3', iconWarning()), 'No simulation pass data was asked for'),
                    }),
                    h('h2', frontLink(runNumber, 'run-detail', { runNumber })),
                    remoteDplDetector.match({
                        Success: (dplDetector) => h('h2', dplDetector.name),
                        Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load detector info'),
                        Loading: () => h('', spinner({ size: 2, absolute: false })),
                        NotAsked: () => tooltip(h('.f3', iconWarning()), 'No detector data was asked for'),
                    }),
                ])),
                qcFlagCreationPanelLink({ simulationPassId }, runNumber, dplDetectorId, remoteUsersDplDetectors),
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
