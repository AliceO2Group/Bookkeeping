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

import { detailsList } from '../../../components/Detail/detailsList.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { createButton } from '../../../components/common/form/createButton.js';
import { deleteButton } from '../../../components/common/form/deleteButton.js';
import { markdownDisplay, markdownInput } from '../../../components/common/markdown/markdown.js';
import { LabelPanelHeaderComponent } from '../../../components/common/panel/LabelPanelHeaderComponent.js';
import { PanelComponent } from '../../../components/common/panel/PanelComponent.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import spinner from '../../../components/common/spinner.js';
import { table } from '../../../components/common/table/table.js';
import { BkpRoles } from '../../../domain/enums/BkpRoles.js';
import scrollTo from '../../../utilities/scrollTo.js';
import { qcFlagsVerificationsActiveColumns } from '../ActiveColumns/qcFlagVerificationsActiveColumns.js';
import { qcFlagDetailsConfiguration } from './qcFlagDetailsConfiguration.js';
import { h, iconWarning, sessionService } from '/js/src/index.js';

/**
 * Render a cancel verification button component
 *
 * @param {function} onclick function called when button is clicked (if null, button will be disabled)
 * @return {Component} the button component
 */
const cancelVerificationButton = (onclick) => h(
    'button#cancel-verification.btn.btn-warning',
    onclick ? { onclick } : { disabled: true },
    'Cancel verification',
);

/**
 * Create verification button
 *
 * @param {boolean} verificationEnabled true if verification is currently enabled
 * @param {function} onClick function called when button is clicked
 * @return {Component} verify button
 */
const verifyButton = (verificationEnabled, onClick) => h(
    '.pv3',
    h(
        'button#verify-qc-flag.btn.btn-primary',
        verificationEnabled ? { disabled: true, title: 'Verification form is opened' } : { onclick: onClick },
        'Verify',
    ),
);

/**
 * Render QC flag details component
 *
 * @param {QcFlagDetailsModel} qcFlagDetailsModel details model
 * @param {object<string, function<*, string|component>>} additionalDetailsConfiguration display configuration for QC flag specific details
 * @returns {Component} details component
 */
export const qcFlagDetailsComponent = (qcFlagDetailsModel, additionalDetailsConfiguration = {}) => {
    const {
        qcFlag: remoteQcFlag,
        dplDetector: remoteDplDetector,
        deleteResult,
        verificationEnabled,
        verificationCreationModel,
    } = qcFlagDetailsModel;

    /**
     * Function to send delete request
     *
     * @return {void}
     */
    const qcFlagDeleteHandler = () => {
        if (confirm('Are you sure you want to delete the QC flag?')) {
            qcFlagDetailsModel.delete();
        }
    };

    /**
     * Function to send verification
     *
     * @return {void}
     */
    const qcFlagVerificationSendHandler = () => {
        if (confirm('Verifying the flag by the same person who added the flag. \
A different person to verify the flag is encouraged. Do you want to continue?')) {
            verificationCreationModel.submit();
        }
    };

    return remoteQcFlag.match({
        NotAsked: () => errorAlert([{ title: 'No data', detail: 'No QC flag data was asked for' }]),
        Loading: () => spinner(),
        Failure: (errors) => errorAlert(errors),
        Success: (qcFlag) => h('.flex-column.g3', [
            h('.flex-row.justify-between.items-center', [
                h(
                    'h2.flex-row.items-center.g2',
                    [
                        `QC Flag ${qcFlag.id}`,
                        qcFlag.deleted ? h('span.badge.f3.danger.bg-gray-light', 'DELETED') : null,
                    ],
                ),
                !qcFlag.deleted && h('.flex-row.g3', [
                    verifyButton(
                        qcFlagDetailsModel.verificationEnabled,
                        () => {
                            qcFlagDetailsModel.verificationEnabled = true;
                        },
                    ),
                    sessionService.hasAccess(BkpRoles.ADMIN) && h('.pv3', deleteResult.match({
                        Loading: () => deleteButton(null, 'Processing...'),
                        Success: () => deleteButton(null, 'Processed!'),
                        Failure: () => deleteButton(qcFlagDeleteHandler),
                        NotAsked: () => qcFlag.verifications?.length > 0
                            ? tooltip(deleteButton(), 'Deleting a verified flag is not allowed')
                            : deleteButton(qcFlagDeleteHandler),
                    })),
                ]),
            ]),
            verificationCreationModel.creationResult.match({
                Failure: (errors) => errorAlert(errors),
                Other: () => null,
            }),
            deleteResult.match({
                Failure: (errors) => errorAlert(errors),
                Other: () => null,
            }),
            h('.flex-column.g3', [
                detailsList(
                    {
                        id: qcFlagDetailsConfiguration.id,
                        ...additionalDetailsConfiguration,
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
                    ? [h(LabelPanelHeaderComponent, 'Comment'), markdownDisplay(qcFlag.comment)]
                    : h('em', 'No comment'),
            ]),
            verificationEnabled && [
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
                            cancelVerificationButton(null),
                            createButton(null, 'Sending...'),
                        ],
                        Success: () => [
                            cancelVerificationButton(null),
                            createButton(null, 'Sent!'),
                        ],
                        Failure: () => [
                            cancelVerificationButton(() => {
                                qcFlagDetailsModel.verificationEnabled = false;
                            }),
                            createButton(
                                verificationCreationModel.isValid() ? qcFlagVerificationSendHandler : null,
                                'Post verification',
                            ),
                        ],
                        NotAsked: () => [
                            cancelVerificationButton(() => {
                                qcFlagDetailsModel.verificationEnabled = false;
                            }),
                            createButton(
                                verificationCreationModel.isValid() ? qcFlagVerificationSendHandler : null,
                                'Post verification',
                            ),
                        ],
                    }),
                ),
            ],
            h('', table(qcFlag.verifications, qcFlagsVerificationsActiveColumns)),
        ]),
    });
};
