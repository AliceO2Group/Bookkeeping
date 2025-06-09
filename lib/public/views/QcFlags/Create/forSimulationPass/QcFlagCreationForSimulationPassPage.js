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
import { creationFormComponent } from '../../../../components/common/form/creationFormComponent.js';
import errorAlert from '../../../../components/common/errorAlert.js';
import spinner from '../../../../components/common/spinner.js';
import { qcFlagCreationComponent } from '../qcFlagCreationComponent.js';
import { frontLink } from '../../../../components/common/navigation/frontLink.js';
import { tooltip } from '../../../../components/common/popover/tooltip.js';

/**
 * Render Quality Control Flag For Simulation Pass creation page
 * @param {Model} model The overall model object
 * @returns {Component} creation page
 */
export const QcFlagCreationForSimulationPassPage = ({ qcFlags: { creationForSimulationPassModel: qcFlagCreationForSimulationPassModel } }) => {
    const { simulationPass: remoteSimulationPass } = qcFlagCreationForSimulationPassModel;

    return [
        h('h2.g2.flex-row.items-center', [
            h('div', 'Create QC flag'),
            remoteSimulationPass?.match({
                Success: ({ id, name }) => [
                    h('', ' for simulation pass '),
                    frontLink(name, 'runs-per-simulation-pass', { simulationPassId: id }),
                ],
                Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load simulation pass info'),
                Loading: () => h('', spinner({ size: 1, absolute: false })),
                NotAsked: () => tooltip(h('.f3', iconWarning()), 'No simulation pass data was asked for'),
            }),
        ]),
        h(
            '.flex-column.g3.flex-grow',
            creationFormComponent(
                qcFlagCreationForSimulationPassModel,
                qcFlagCreationForSimulationPassModel.qcFlagCreationModel.match({
                    Success: (qcFlagCreationModel) => qcFlagCreationComponent(qcFlagCreationModel),
                    Loading: () => spinner({ absolute: false }),
                    Failure: (errors) => errorAlert(errors),
                    NotAsked: () => null,
                }),
            ),
        ),
    ];
};
