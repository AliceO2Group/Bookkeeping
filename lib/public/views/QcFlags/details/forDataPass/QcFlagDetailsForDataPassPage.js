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
import { LabelPanelHeaderComponent } from '../../../../components/common/panel/LabelPanelHeaderComponent.js';
import { PanelComponent } from '../../../../components/common/panel/PanelComponent.js';
import spinner from '../../../../components/common/spinner.js';
import { qcFlagDetailsConfiguration } from '../detailsConfiguration.js';
import { h } from '/js/src/index.js';

/**
 * Render QC flag details for data pass page
 *
 * @param {Model} model The overall model object.
 * @returns {Component} The details page
 */
export const QcFlagDetailsForDataPassPage = ({ qcFlags: { detailsForDataPassModel, forDataPassOverviewModel } }) => {
    const { qcFlag: remoteQcFlag, deleteResult } = detailsForDataPassModel;

    return h('', {
        onremove: () => {
            forDataPassOverviewModel.reset();
        },
    }, [
        h('.flex-row.justify-between.items-center', [
            h('h2', 'QC Flag Details'),
            h('.pv3', detailsForDataPassModel.deleteResult.match({
                Loading: () => deleteButton(null, 'Processing...'),
                Success: () => deleteButton(null, 'Processed!'),
                Failure: () => deleteButton(() => detailsForDataPassModel.delete()),
                NotAsked: () => deleteButton(() => detailsForDataPassModel.delete()),
            })),
        ]),
        h('.flex-column', [
            deleteResult.match({
                Failure: (errors) => errorAlert(errors),
                Other: () => null,
            }),
            remoteQcFlag.match({
                Success: (qcFlag) => h('.flex-row.g3.flex-grow', [
                    h('flex-column.g3.w-100', [
                        h('.flex-column', [
                            detailsList(
                                qcFlagDetailsConfiguration(detailsForDataPassModel),
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
                ]),
                Loading: () => spinner(),
                NotAsked: () => errorAlert([{ title: 'No data', detail: 'No QC flag data was asked for' }]),
                Failure: (errors) => errorAlert(errors),
            }),
        ]),
    ]);
};
