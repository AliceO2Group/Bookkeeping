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
import { detailsList } from '../../../components/Detail/detailsList.js';

/**
 * Create panel with QC flag details display
 *
 * @param {QcFlagDetailsModel} detailsModel model
 * @return {Component} panel
 */
export const qcFlagDetailsComponent = (detailsModel) => {
    const { qcFlag: remoteQcFlag, deleteResult } = detailsModel;

    return [
        deleteResult.match({
            Failure: (errors) => errorAlert(errors),
            Other: () => null,
        }),
        h('flex-column.g3.w-100', [
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
            h(
                PanelComponent,
                [
                    remoteQcFlag.match({
                        Success: (qcFlag) => qcFlag.comment
                            ? [
                                h(LabelPanelHeaderComponent, 'Comment'),
                                markdownDisplay(qcFlag.comment),
                            ]
                            : h('em', 'No comment'),
                        Other: () => null,
                    }),
                ],
            ),
        ]),
    ];
};
