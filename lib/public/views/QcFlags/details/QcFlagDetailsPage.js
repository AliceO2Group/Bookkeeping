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
import { LabelPanelHeaderComponent } from '../../../components/common/panel/LabelPanelHeaderComponent.js';
import { PanelComponent } from '../../../components/common/panel/PanelComponent.js';
import { markdownDisplay } from '../../../components/common/markdown/markdown.js';
import { qcFlagDetailsConfiguration } from './detailsConfiguration.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { deleteButton } from '../../../components/common/form/deleteButton.js';
import { detailsList } from '../../../components/Detail/detailsList.js';
import spinner from '../../../components/common/spinner.js';

/**
 * Create panel with QC flag details display
 * @param {QcFlagDetailsModel} detailsModel model
 * @return {Component} panel
 */
const qcFlagDetailsComponent = (detailsModel) => {
    const { qcFlag: remoteQcFlag } = detailsModel;

    const commentPanel =
    h(
        PanelComponent,
        [
            remoteQcFlag.match({
                Success: (qcFlag) => qcFlag.comment
                    ? [
                        h(LabelPanelHeaderComponent, 'Comment'),
                        markdownDisplay(
                            qcFlag.comment,
                            {
                                classes: 'w-100',
                            },
                        ),
                    ]
                    : h('em', 'No comment'),
                Other: () => null,
            }),
        ],
    );

    const leftPanel = [
        remoteQcFlag.match({
            Success: (qcFlag) => h('.flex-column', [
                detailsList(
                    qcFlagDetailsConfiguration(detailsModel),
                    qcFlag,
                    { selector: 'qc-flag-details' },
                ),
            ]),
            Other: () => null,
        }),
        commentPanel,
    ];

    const rightPanel = [
        detailsModel.deleteResult.match({
            Failure: (errors) => errorAlert(errors),
            Other: () => null,
        }),
        h('.pv3', detailsModel.deleteResult.match({
            Loading: () => deleteButton(null, 'Sending...'),
            Success: () => deleteButton(null, 'Sent!'),
            Failure: () => deleteButton(() => detailsModel.delete()),
            NotAsked: () => deleteButton(() => detailsModel.delete()),
        })),
    ];

    return [
        h('.w-50.flex-column.g3', leftPanel),
        h('.w-50.flex-column.g3.items-center', rightPanel),
    ];
};

/**
 * Render QC flag details page
 * @param {Model} model The overall model object.
 * @returns {Component} The details page
 */
export const QcFlagDetailPage = ({ qcFlags: { detailsModel, forDataPassOverviewModel, forSimulationPassOverviewModel } }) => h('', {
    onremove: () => {
        forDataPassOverviewModel.reset();
        forSimulationPassOverviewModel.reset();
    },
}, [
    h('.flex-row.justify-between.items-center', h('.flex-row.g3', h('h2', 'QC Flag Details'))),
    detailsModel.qcFlag.match({
        Success: () => h('.w-100.flex-column', [h('.flex-row.g3.flex-grow', [qcFlagDetailsComponent(detailsModel)])]),
        Loading: () => spinner(),
        NotAsked: () => errorAlert([{ title: 'No data', detail: 'No QC flag data was asked for' }]),
        Failure: (errors) => errorAlert(errors),
    }),
]);
