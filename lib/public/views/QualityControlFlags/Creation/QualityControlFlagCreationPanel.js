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
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { qcFlagsChartComponent } from '../qcFlagsVisualization/qcFlagsVisualziationComponent.js';
import { qualityControlFlagBreadcrum } from '../common/qualityControlBreadcrumbs.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { LabelPanelHeaderComponent } from '../../../components/common/panel/LabelPanelHeaderComponent.js';
import { PanelComponent } from '../../../components/common/panel/PanelComponent.js';
import { markdownInput } from '../../../components/common/markdown/markdown.js';
import { selectionDropdown } from '../../../components/common/selection/dropdown/selectionDropdown.js';

const TABLEROW_HEIGHT = 35;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 *
 */
const creationFormsPanel = (creationModel) => {
    console.log(creationModel)
    const rightPanel = [
        h(PanelComponent, [
            h(LabelPanelHeaderComponent, { for: 'flag-reason' }, 'Flag Reason'),
            selectionDropdown(
                creationModel._flagReasonsSelectionModel,
                { selectorPrefix: 'flag-reason', displayOptions: ['qcfb', 'qcfa'] },
            ),
        ]),
        h(
            PanelComponent,
            { class: 'flex-column flex-grow' },
            [
                h(LabelPanelHeaderComponent, 'Comment'),
                markdownInput(
                    creationModel.comment,
                    {
                        id: 'text',
                        placeholder: 'Your message...',
                        // eslint-disable-next-line no-return-assign
                        oninput: (e) => creationModel.comment = e.target.value,
                    },
                // { height: '100%' },
                ),
            ],
        ),
    ];

    return [
        h('.flex-row.g3.flex-grow', [
            h('.w-40.flex-column.g3', rightPanel),
            h('.w-60.flex-column.g3', ''),
        ]),
    ];
};

/**
 * Render Quality Control Flags Overview Model
 * @param {Model} model The overall model object.
 * @returns {Component} The overview screen
 */
export const QualityControlFlagCreationPage = ({ qualityControlFlagsModel: {
    overviewModel: qualityControlFlagsOverviewModel,
    creationModel } }) => {
    qualityControlFlagsOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const { items, run, dataPass, detector } = qualityControlFlagsOverviewModel;

    return h('', {
        onremove: () => qualityControlFlagsOverviewModel.reset(),
    }, [
        h('.flex-row.justify-between.items-center', [
            h('.flex-row.g3', [
                h('h2', 'Creation'),
                qualityControlFlagBreadcrum(run, dataPass, detector),
            ]),
            frontLink(h('.flex-row.items-center.g1', 'QC'), 'quality-control-flags', {
                runNumber: qualityControlFlagsOverviewModel.runNumber,
                dataPassId: qualityControlFlagsOverviewModel.dataPassId,
                detectorId: qualityControlFlagsOverviewModel.detectorId,
            }, {
                class: 'btn btn-primary',
                title: 'Quality control flag overview',
            }),
        ]),
        h('.w-100.flex-column', [
            items.match({
                Success: (qcfPayload) => run.match({
                    Success: (runPayload) => qcFlagsChartComponent(qcfPayload, runPayload, () => qualityControlFlagsOverviewModel.notify()),
                    Other: () => null,
                }),
                Other: () => null,
            }),
            // Creation
            creationFormsPanel(creationModel),

            /*
             * H('button.btn.btn-success#send.w-20', {
             *     disabled,
             *     onclick: () => logCreationModel.submit(),
             * }, logCreationModel.createdLog.isLoading() ? 'Creating...' : 'Post log');
             */
        ]),
    ]);
};
