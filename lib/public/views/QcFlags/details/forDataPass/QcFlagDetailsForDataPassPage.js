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

import { BkpRoles } from '../../../../domain/enums/BkpRoles.js';
import { detailsList } from '../../../../components/Detail/detailsList.js';
import errorAlert from '../../../../components/common/errorAlert.js';
import { deleteButton } from '../../../../components/common/form/deleteButton.js';
import { markdownDisplay, markdownInput } from '../../../../components/common/markdown/markdown.js';
import { frontLink } from '../../../../components/common/navigation/frontLink.js';
import { LabelPanelHeaderComponent } from '../../../../components/common/panel/LabelPanelHeaderComponent.js';
import { PanelComponent } from '../../../../components/common/panel/PanelComponent.js';
import { tooltip } from '../../../../components/common/popover/tooltip.js';
import spinner from '../../../../components/common/spinner.js';
import { qcFlagDetailsConfiguration } from '../qcFlagDetailsConfiguration.js';
import { h, iconWarning, sessionService } from '/js/src/index.js';
import { table } from '../../../../components/common/table/table.js';
import { qcFlagsVerificationsActiveColumns } from '../../ActiveColumns/qcFlagVerificationsActiveColumns.js';
import { creationFormComponent } from '../../../../components/common/form/creationFormComponent.js';

/**
 * Render QC flag details for data pass page
 *
 * @param {Model} model The overall model object.
 * @returns {Component} The details page
 */
export const QcFlagDetailsForDataPassPage = ({ qcFlags: { detailsForDataPassModel } }) => {
    const {
        qcFlag: remoteQcFlag,
        dataPass: remoteDataPass,
        dplDetector: remoteDplDetector,
        deleteResult,
        verificationEnabled,
        verificationCreationModel,
    } = detailsForDataPassModel;

    return h('', [
        h('.flex-row.justify-between.items-center', [
            h('h2', 'QC Flag Details'),
            h('.flex-row', [
                h('.pv3', h(
                    'button#verify.btn.btn-primary',
                    {
                        onclick: () => {
                            detailsForDataPassModel.verificationEnabled = !verificationEnabled;
                        },
                    },
                    detailsForDataPassModel.verificationEnabled ? 'Cancel verification' : 'Verify',
                )),
                sessionService.hasAccess(BkpRoles.ADMIN) && h('.pv3', deleteResult.match({
                    Loading: () => deleteButton(null, 'Processing...'),
                    Success: () => deleteButton(null, 'Processed!'),
                    Failure: () => deleteButton(() => detailsForDataPassModel.delete()),
                    NotAsked: () => deleteButton(() => detailsForDataPassModel.delete()),
                })),
            ]),
        ]),
        h('.flex-grow', [
            deleteResult.match({
                Failure: (errors) => errorAlert(errors),
                Other: () => null,
            }),
            remoteQcFlag.match({
                Success: (qcFlag) =>
                    h('.flex-column.flex-grow.g3', [
                        h('.flex-column', [
                            detailsList(
                                {
                                    id: qcFlagDetailsConfiguration.id,
                                    dataPass: {
                                        name: 'Data pass',
                                        visible: true,
                                        format: () => remoteDataPass.match({
                                            Success: (dataPass) => frontLink(dataPass.name, 'runs-per-data-pass', { dataPassId: dataPass.id }),
                                            Loading: () => spinner({ size: 3, absolute: false }),
                                            NotAsked: () => tooltip(h('.f3', iconWarning()), 'No data pass data was asked for'),
                                            Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load data pass info'),
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
                        h('', table(qcFlag.verifications, qcFlagsVerificationsActiveColumns)),

                        verificationEnabled &&
                        creationFormComponent(
                            verificationCreationModel,
                            [
                                h(
                                    PanelComponent,
                                    [
                                        h(LabelPanelHeaderComponent, 'Verification comment'),
                                        markdownInput(
                                            verificationCreationModel.formData.comment,
                                            {
                                                id: 'comment',
                                                placeholder: 'Your message...',
                                                oninput: (e) => verificationCreationModel.patchFormData({ comment: e.target.value }),
                                            },
                                            { height: '100%' },
                                        ),
                                    ],
                                ),
                            ],
                        ),
                    ]),
                Loading: () => spinner(),
                NotAsked: () => errorAlert([{ title: 'No data', detail: 'No QC flag data was asked for' }]),
                Failure: (errors) => errorAlert(errors),
            }),
        ]),
    ]);
};
