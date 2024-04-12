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
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';

/**
 * Render the creation form of QC flag
 *
 * @param {Run} run the run on which the QC flag will apply
 * @param {QcFlagCreationModel} creationModel the creation model
 * @return {Component} the component
 */
const qcFlagCreationForm = (run, creationModel) => {
    const { timeRangeModel, isTimeBasedQcFlag, canSendTimeBasedQcFlag } = creationModel;

    /**
     * Create QC flag timestamp inputs if model is in time-based mode
     * @param {Run} run run
     * @return {Componenet|null} QC flag timestamp inputs
     */
    const optionalTimeInputs = (run) => h(
        '.ph3.pv2',
        isTimeBasedQcFlag
            ? timeRangeInput(timeRangeModel, { seconds: true, min: run.startTime, max: run.endTime })
            : h('em', 'The tag will be applied on the full run'),
    );

    return [
        h('.flex-column.g3', [
            h('.flex-row.items-start.g3', [
                h(PanelComponent, [
                    h(LabelPanelHeaderComponent, 'Run Start'),
                    h('.p2', formatRunStart(run, false)),
                ]),
                h(PanelComponent, [
                    h(LabelPanelHeaderComponent, 'Run End'),
                    h('.p2', formatRunEnd(run, false)),
                ]),
                ...canSendTimeBasedQcFlag
                    ? [
                        h(PanelComponent, { class: 'flex-grow items-center' }, [
                            h(
                                LabelPanelHeaderComponent,
                                { for: 'time-based-toggle' },
                                h('.flex-row.items-center.g3', [
                                    'Time based',
                                    h('.switch', [
                                        h(
                                            'input#time-based-toggle',
                                            {
                                                checked: Boolean(isTimeBasedQcFlag),
                                                onchange: () => {
                                                    creationModel.setIsTimeBasedQcFlag(!isTimeBasedQcFlag);
                                                },
                                                type: 'checkbox',
                                            },
                                        ),
                                        h('span.slider.round'),
                                    ]),
                                    isTimeBasedQcFlag ? h('.primary', 'Yes') : h('.warning', 'No'),
                                ]),
                            ),
                            optionalTimeInputs(run),
                        ]),
                    ]
                    : [
                        h('.alert', 'Can send run-based QC flag only as start or stop of run is missing'),
                        null,
                    ],
            ]),
        ]),
        h(PanelComponent, [
            h(LabelPanelHeaderComponent, { for: 'flag-type' }, 'Flag Type'),
            selectionDropdown(
                creationModel.flagTypeSelectionModel,
                { selectorPrefix: 'flag-type' },
            ),
        ]),
        h(
            PanelComponent,
            { class: 'flex-column flex-grow' },
            [
                h(LabelPanelHeaderComponent, 'Comment'),
                markdownInput(
                    creationModel.formData.comment,
                    {
                        id: 'comment',
                        placeholder: 'Your message...',
                        oninput: (e) => creationModel.patchFormData({ comment: e.target.value }),
                    },
                    { height: '100%' },
                ),
            ],
        ),
    ];
};

/**
 * Create panel with input forms for QC flag creation
 * @param {QcFlagCreationModel} creationModel model
 * @returns {Component} creation component
 */
export const qcFlagCreationComponent = (creationModel) => h(
    '.flex-column.g3.flex-grow',
    creationFormComponent(creationModel, [
        creationModel.run.match({
            Success: (run) => qcFlagCreationForm(run, creationModel),
            Loading: () => spinner({ absolute: false }),
            Failure: (errors) => errorAlert(errors),
            NotAsked: () => null,
        }),
    ]),
);
