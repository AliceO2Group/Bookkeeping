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
import { qcFlagsActiveColumns } from '../ActiveColumns/qcFlagsActiveColumns.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { qcFlagCreationPanelLink } from '../../../components/qcFlags/qcFlagCreationPanelLink.js';
import { qcFlagsBreadcrumbs } from '../../../components/qcFlags/qcFlagsBreadcrumbs.js';
import { remoteDplDetectorUserHasAccessTo } from '../../../services/detectors/remoteDplDetectorUserHasAccessTo.js';
import { mergeRemoteData } from '../../../utilities/mergeRemoteData.js';
import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';

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
    dplDetectorsUserHasAccessTo: remoteDplDetectorsUserHasAccessTo,
}) => {
    const {
        simulationPass: remoteSimulationPass,
        run: remoteRun,
        detectorId,
        dplDetector: remoteDplDetector,
        items: remoteQcFlags,
        sortModel,
        pagination: paginationModel,
    } = qcFlagsForSimulationPassOverviewModel;

    qcFlagsForSimulationPassOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const activeColumns = {
        qcFlagId: {
            name: 'Id',
            visible: true,
            format: (qcFlagId, { simulationPassId, detectorId, runNumber }) =>
                frontLink(
                    h('.btn.btn-primary.white', qcFlagId),
                    'qc-flag-details-for-simulation-pass',
                    { id: qcFlagId, simulationPassId, runNumber, detectorId },
                ),
            classes: 'w-5',
        },
        ...qcFlagsActiveColumns,
    };

    return h(
        '',
        { onremove: () => qcFlagsForSimulationPassOverviewModel.reset() },
        mergeRemoteData([
            remoteSimulationPass,
            remoteRun,
            remoteDplDetector,
            remoteDplDetectorUserHasAccessTo(detectorId, remoteDplDetectorsUserHasAccessTo),
        ])
            .match({
                NotAsked: () => null,
                Failure: (errors) => errorAlert(errors),
                Success: ([simulationPass, run, detector, detectorUserHasAccessTo]) => [
                    h('.flex-row.justify-between.items-center', [
                        qcFlagsBreadcrumbs({ simulationPass, run, detector }),
                        qcFlagCreationPanelLink(
                            { simulationPass },
                            run,
                            detectorUserHasAccessTo,
                        ),
                    ]),
                    h('.w-100.flex-column', [
                        table(
                            remoteQcFlags,
                            activeColumns,
                            { classes: '.table-sm' },
                            null,
                            { sort: sortModel },
                        ),
                        paginationComponent(paginationModel),
                    ]),
                ],
                Loading: () => spinner(),
            }),
    );
};
