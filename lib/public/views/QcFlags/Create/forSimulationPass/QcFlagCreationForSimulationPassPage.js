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
import { qcFlagCreationComponent } from '../qcFlagCreationComponent.js';
import { qcFlagOverviewPanelLink } from '../../../../components/qcFlags/qcFlagsPagesButtons.js';
import { qcFlagsBreadcrumbs } from '../../../../components/qcFlags/qcFlagsBreadcrumbs.js';

/**
 * Render Quality Control Flag For Simulation Pass creation page
 * @param {Model} model The overall model object
 * @returns {Component} creation page
 */
export const QcFlagCreationForSimulationPassPage = ({ qcFlags: { creationForSimulationPassModel: qcFlagCreationForSimulationPassModel } }) => {
    const {
        singleRun: remoteRun,
        singleDplDetector: remoteDplDetector,
        simulationPass: remoteSimulationPass,
        runNumbers,
        simulationPassId,
        dplDetectorIds,
    } = qcFlagCreationForSimulationPassModel;

    return [
        h('.flex-row.justify-between.items-center', [
            dplDetectorIds.length > 1
                ? qcFlagsBreadcrumbs({ remoteSimulationPass })
                : qcFlagsBreadcrumbs({ remoteSimulationPass, remoteRun, remoteDplDetector }),
            dplDetectorIds.length === 1 &&
                qcFlagOverviewPanelLink(
                    'QC',
                    { simulationPassId, runNumber: runNumbers, dplDetectorId: dplDetectorIds[0] },
                    { class: 'btn btn-primary items-center' },
                ),
        ]),
        qcFlagCreationComponent(qcFlagCreationForSimulationPassModel),
    ];
};
