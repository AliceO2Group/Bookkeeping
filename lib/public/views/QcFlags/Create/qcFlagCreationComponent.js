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
import { markdownInput } from '../../../components/common/markdown/markdown.js';
import { selectionDropdown } from '../../../components/common/selection/dropdown/selectionDropdown.js';
import { creationFormComponent } from '../../../components/common/form/creationFormComponent.js';
import { timeRangeInput } from '../../../components/common/form/inputs/TimeRangeInputComponent.js';
import { formatRunStart } from '../../Runs/format/formatRunStart.js';
import { formatRunEnd } from '../../Runs/format/formatRunEnd.js';

/**
 * Create panel with input forms for QC flag creation
 * @param {QcFlagCreationModel} creationModel model
 * @returns {Component} creation component
 */
export const qcFlagCreationComponenet = (creationModel) => {
    const rightPanel = [
        h(PanelComponent, [
            h(LabelPanelHeaderComponent, { for: 'flag-type' }, 'Flag Type'),
            selectionDropdown(
                creationModel.flagTypeSelectionModel,
                { selectorPrefix: 'flag-type' },
            ),
        ]),
        h(
            PanelComponent,
            [
                h(LabelPanelHeaderComponent, 'Comment'),
                markdownInput(
                    creationModel.formData.comment,
                    {
                        id: 'comment',
                        placeholder: 'Your message...',
                        oninput: (e) => creationModel.patchFormData({ comment: e.target.value }),
                    },
                    { height: '30rem' },
                ),
            ],
        ),
    ];
    const { timeRangeModel, useTimeBasedQcFlag, canSendTimeBasedQcFlag } = creationModel;

    /**
     * Create QC flag timestamp inputs if model is in time-based mode
     * @param {Run} run run
     * @return {Componenet|null} QC flag timestamp inputs
     */
    const optionalTimeInputs = (run) => useTimeBasedQcFlag
        ? timeRangeInput(timeRangeModel, { seconds: true, min: run.startTime, max: run.endTime })
        : null;

    const leftPanel = creationModel.run.match({
        Success: (run) => [
            h('.flex-row.g3', [
                h(PanelComponent, [
                    h(LabelPanelHeaderComponent, 'Run Start'),
                    formatRunStart(run, false),
                ]),
                h(PanelComponent, [
                    h(LabelPanelHeaderComponent, 'Run End'),
                    formatRunEnd(run, false),
                ]),
                canSendTimeBasedQcFlag ? h(PanelComponent, [
                    h(LabelPanelHeaderComponent, { for: 'time-based-toggle' }, 'Time based'),
                    h(
                        'label.flex-row.g1.items-center',
                        [
                            h('.switch#time-based-toggle', [
                                h(
                                    'input',
                                    {
                                        checked: Boolean(useTimeBasedQcFlag),
                                        onchange: () => {
                                            creationModel.useTimeBasedQcFlag = !useTimeBasedQcFlag;
                                        },
                                        type: 'checkbox',
                                    },
                                ),
                                h('span.slider.round'),
                            ]),
                            useTimeBasedQcFlag ? h('.primary', 'Yes') : h('.warning', 'No'),
                        ],
                    ),
                ]) : null,
            ]),
            canSendTimeBasedQcFlag
                ? optionalTimeInputs(run)
                : h('.alert', 'Can send run-based QC flag only as start or stop of run is missing'),
        ],
        Other: () => null,
    });

    return h('.w-100.flex-column', [
        h('.flex-row.g3.flex-grow', [
            h('.w-40.flex-column.g3', rightPanel),
            h('.w-60.flex-column.g3', creationFormComponent(creationModel, leftPanel)),
        ]),
    ]);
};
