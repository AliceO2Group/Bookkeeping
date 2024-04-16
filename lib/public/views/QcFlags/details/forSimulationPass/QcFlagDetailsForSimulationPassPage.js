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

import { detailsList } from '../../../../components/Detail/detailsList.js';
import errorAlert from '../../../../components/common/errorAlert.js';
import { deleteButton } from '../../../../components/common/form/deleteButton.js';
import { markdownDisplay } from '../../../../components/common/markdown/markdown.js';
import { frontLink } from '../../../../components/common/navigation/frontLink.js';
import { LabelPanelHeaderComponent } from '../../../../components/common/panel/LabelPanelHeaderComponent.js';
import { PanelComponent } from '../../../../components/common/panel/PanelComponent.js';
import { tooltip } from '../../../../components/common/popover/tooltip.js';
import spinner from '../../../../components/common/spinner.js';
import { qcFlagDetailsConfiguration } from '../detailsConfiguration.js';
import { h, iconWarning } from '/js/src/index.js';

/**
 * Render QC flag details for simulation pass page
 *
 * @param {Model} model The overall model object.
 * @returns {Component} The details page
 */
export const QcFlagDetailsForSimulationPassPage = ({ qcFlags: { detailsForSimulationPassModel } }) => {
    const { qcFlag: remoteQcFlag, deleteResult, simulationPass: remoteSimulationPass } = detailsForSimulationPassModel;
    const qcFlagDetailsDispayConfigration = qcFlagDetailsConfiguration(detailsForSimulationPassModel);

    return h('', [
        h('.flex-row.justify-between.items-center', [
            h('h2', 'QC Flag Details'),
            h('.pv3', deleteResult.match({
                Loading: () => deleteButton(null, 'Processing...'),
                Success: () => deleteButton(null, 'Processed!'),
                Failure: () => deleteButton(() => detailsForSimulationPassModel.delete()),
                NotAsked: () => deleteButton(() => detailsForSimulationPassModel.delete()),
            })),
        ]),
        h('.flex-column', [
            deleteResult.match({
                Failure: (errors) => errorAlert(errors),
                Other: () => null,
            }),
            remoteQcFlag.match({
                Success: (qcFlag) =>
                    h('flex-grow.g3', [
                        h('.flex-column', [
                            detailsList(
                                {
                                    id: qcFlagDetailsDispayConfigration.id,
                                    simulationPass: {
                                        name: 'Simulation pass',
                                        visible: true,
                                        format: () => remoteSimulationPass.match({
                                            Success: (simulationPass) =>
                                                frontLink(
                                                    simulationPass.name,
                                                    'runs-per-simulation-pass',
                                                    { simulationPassId: simulationPass.id },
                                                ),
                                            Loading: () => spinner({ size: 3, absolute: false }),
                                            NotAsked: () => tooltip(h('.f3', iconWarning()), 'No simulation pass data was asked for'),
                                            Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load simulation pass info'),
                                        }),
                                    },
                                    ...qcFlagDetailsDispayConfigration,
                                },
                                qcFlag,
                                { selector: 'qc-flag-details' },
                            ),
                        ]),
                        h(PanelComponent, [
                            qcFlag.comment
                                ? [
                                    h(LabelPanelHeaderComponent, 'Comment'),
                                    markdownDisplay(qcFlag.comment),
                                ]
                                : h('em', 'No comment'),
                        ]),
                    ]),
                Loading: () => spinner(),
                NotAsked: () => errorAlert([{ title: 'No data', detail: 'No QC flag data was asked for' }]),
                Failure: (errors) => errorAlert(errors),
            }),
        ]),
    ]);
};
