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
import { QcFlagsOverviewComponenet } from '../Overview/qcFlagOverviewComponent.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { breadcrumbs } from '../../../components/common/navigation/breadcrumbs.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import spinner from '../../../components/common/spinner.js';
import { iconPlus } from '/js/src/icons.js';

/**
 * Render Quality Control Flags For Simulation Pass Overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview page
 */
export const QcFlagsForSimulationPassOverviewPage = ({
    qcFlags: { forSimulationPassOverviewModel: qcFlagsForSimulationPassOverviewModel },
}) => {
    const {
        run: remoteRun,
        dplDetector: remoteDplDetector,
        simulationPass: remoteSimulationPass,
        runNumber,
        simulationPassId,
        dplDetectorId,
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
                    remoteRun.match({
                        Success: (run) => h('h2', frontLink(run.runNumber, 'run-detail', { runNumber: run.runNumber })),
                        Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load run info'),
                        Loading: () => h('', spinner({ size: 2, absolute: false })),
                        NotAsked: () => tooltip(h('.f3', iconWarning()), 'No run data was asked for'),
                    }),
                    remoteDplDetector.match({
                        Success: (dplDetector) => h('h2', dplDetector.name),
                        Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load detector info'),
                        Loading: () => h('', spinner({ size: 2, absolute: false })),
                        NotAsked: () => tooltip(h('.f3', iconWarning()), 'No detector data was asked for'),
                    }),
                ])),
                frontLink(
                    h('.flex-row.items-center.g1', [h('small', iconPlus()), 'QC']),
                    'qc-flag-creation-for-simulation-pass',
                    {
                        runNumber,
                        simulationPassId,
                        dplDetectorId,
                    },
                    {
                        class: 'btn btn-primary',
                        title: 'Create a QC flag',
                    },
                ),
            ]),
            QcFlagsOverviewComponenet(qcFlagsForSimulationPassOverviewModel),
        ],
    );
};
