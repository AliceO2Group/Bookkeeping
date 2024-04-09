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
import { QcFlagsOverviewComponenet } from '../Overview/qcFlagOverviewComponent.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

/**
 * Render Quality Control Flags For Simulation Pass Overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview page
 */
export const QcFlagsForSimulationPassOverviewPage = ({ qcFlagsModel:
    { overviewForSimulationPassModel: qcFlagsForSimulationPassOverviewModel } }) => {
    /**
     * Create links to runs per simulation pass
     * @param {SimulationPass} simulationPass the simulation pass
     * @return {Componenet} in-breadcrumbs link to runs per simulation page
     */
    const linkFactory = (simulationPass) =>
        h('h2', frontLink(simulationPass.name, 'runs-per-simulation-pass', { simulationPassId: simulationPass.id }));
    return QcFlagsOverviewComponenet(qcFlagsForSimulationPassOverviewModel, linkFactory);
};
