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
import { cancelButton } from '../../../../components/common/form/cancelButton.js';
import { createButton } from '../../../../components/common/form/createButton.js';
import { deleteButton } from '../../../../components/common/form/deleteButton.js';
import { markdownDisplay, markdownInput } from '../../../../components/common/markdown/markdown.js';
import { frontLink } from '../../../../components/common/navigation/frontLink.js';
import { LabelPanelHeaderComponent } from '../../../../components/common/panel/LabelPanelHeaderComponent.js';
import { PanelComponent } from '../../../../components/common/panel/PanelComponent.js';
import { tooltip } from '../../../../components/common/popover/tooltip.js';
import spinner from '../../../../components/common/spinner.js';
import { table } from '../../../../components/common/table/table.js';
import { BkpRoles } from '../../../../domain/enums/BkpRoles.js';
import scrollTo from '../../../../utilities/scrollTo.js';
import { qcFlagsVerificationsActiveColumns } from '../../ActiveColumns/qcFlagVerificationsActiveColumns.js';
import { qcFlagDetailsConfiguration } from '../qcFlagDetailsConfiguration.js';
import { h, iconWarning, sessionService } from '/js/src/index.js';

/**
 * Render QC flag details for simulation pass page
 *
 * @param {Model} model The overall model object.
 * @returns {Component} The details page
 */
export const QcFlagDetailsForSimulationPassPage = ({ qcFlags: { detailsForSimulationPassModel } }) => {
    const {
        qcFlag: remoteQcFlag,
        simulationPass: remoteSimulationPass,
        dplDetector: remoteDplDetector,
        deleteResult,
        verificationEnabled,
        verificationCreationModel,
    } = detailsForSimulationPassModel;

    return h('', [
        h('.flex-row.justify-between.items-center', [
            h('h2', 'QC Flag Details'),
            h('.flex-row.g3', [
                !verificationEnabled && h('.pv3', h(
                    'button#verify.btn.btn-primary',
                    {
                        onclick: () => {
                            detailsForSimulationPassModel.verificationEnabled = true;
                        },
                    },
                    'Verify',
                )),
                sessionService.hasAccess(BkpRoles.ADMIN) && h('.pv3', deleteResult.match({
                    Loading: () => deleteButton(null, 'Processing...'),
                    Success: () => deleteButton(null, 'Processed!'),
                    Failure: () => deleteButton(() => detailsForSimulationPassModel.delete()),
                    NotAsked: () => deleteButton(() => detailsForSimulationPassModel.delete()),
                })),
            ]),
        ]),
        verificationCreationModel.creationResult.match({
            Failure: (errors) => errorAlert(errors),
            Other: () => null,
        }),
        h('.flex-grow', [
            deleteResult.match({
                Failure: (errors) => errorAlert(errors),
                Other: () => null,
            }),
            remoteQcFlag.match({
                Success: (qcFlag) =>
                    h('.flex-grow.g3', [
                        h('.flex-column', [
                            detailsList(
                                {
                                    id: qcFlagDetailsConfiguration.id,
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
                                    dplDetector: {
                                        name: 'Detector',
                                        visible: true,
                                        format: () => remoteDplDetector.match({
                                            Success: (dplDetector) => dplDetector.name,
                                            Loading: () => spinner({ size: 3, absolute: false }),
                                            NotAsked: () => tooltip(h('.f3', iconWarning()), 'No dpl detector data was asked for'),
                                            Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load dpl detector info'),
                                        }),
                                    },
                                    ...qcFlagDetailsConfiguration,
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
                        verificationEnabled &&
                            [
                                h('.pv3', ''),
                                h(
                                    PanelComponent,
                                    [
                                        h(LabelPanelHeaderComponent, 'Verification comment'),
                                        markdownInput(
                                            verificationCreationModel.formData.comment,
                                            {
                                                id: 'verification-comment',
                                                placeholder: 'Your message...',
                                                oninput: (e) => verificationCreationModel.patchFormData({ comment: e.target.value }),
                                            },
                                            { height: '100%' },
                                        ),
                                    ],
                                ),
                                h(
                                    '.pv3.flex-row.g3',
                                    {
                                        oncreate: () => {
                                            scrollTo('#verification-comment ~ .CodeMirror');
                                        },
                                    },
                                    verificationCreationModel.creationResult.match({
                                        Loading: () => [
                                            cancelButton(null, 'Cancel verification'),
                                            createButton(null, 'Sending...'),
                                        ],
                                        Success: () => [
                                            cancelButton(null, 'Cancel verification'),
                                            createButton(null, 'Sent!'),
                                        ],
                                        Failure: () => [
                                            cancelButton(() => {
                                                detailsForSimulationPassModel.verificationEnabled = false;
                                            }, 'Cancel verification'),
                                            createButton(verificationCreationModel.isValid() ? () => verificationCreationModel.submit() : null),
                                        ],
                                        NotAsked: () => [
                                            cancelButton(() => {
                                                detailsForSimulationPassModel.verificationEnabled = false;
                                            }, 'Cancel verification'),
                                            createButton(verificationCreationModel.isValid() ? () => verificationCreationModel.submit() : null),
                                        ],
                                    }),
                                ),
                            ],
                        h('.pv3', ''),
                        h('', table(qcFlag.verifications, qcFlagsVerificationsActiveColumns)),
                    ]),
                Loading: () => spinner(),
                NotAsked: () => errorAlert([{ title: 'No data', detail: 'No QC flag data was asked for' }]),
                Failure: (errors) => errorAlert(errors),
            }),
        ]),
    ]);
};
