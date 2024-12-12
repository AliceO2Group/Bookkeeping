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
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { getRunNotSubjectToQcReason, isRunNotSubjectToQc } from '../../../components/qcFlags/isRunSubjectToQc.js';
import { MultipleQcFlagsCreationModel } from './MultipleQcFlagsCreationModel.js';

/**
 * Render the creation form of QC flag
 *
 * @param {MultipleQcFlagsCreationModel} creationModel the creation model
 * @return {Component} the component
 */
const multipleQcFlagsCreationForm = (creationModel) => {
    const { timeRangeModel, isTimeBased, startTime, endTime } = creationModel;

    /**
     * Create QC flag timestamp inputs if model is in time-based mode
     * @return {Component} QC flag timestamp inputs
     */
    const timeBasedPanelBody = () => {
        let content;
        if (!endTime || !startTime) {
            content = h('em', 'Missing start/stop, the flag will be applied on the full run');
        } else if (isTimeBased) {
            content = timeRangeInput(timeRangeModel, { seconds: true, min: startTime, max: endTime });
        } else {
            content = h('em', 'The flag will be applied on the full run');
        }

        return h('.ph3.pv2', content);
    };

    return [
        h('.flex-column.g3', [
            h('.flex-row.items-start.g3', [
                h(PanelComponent, [
                    h(LabelPanelHeaderComponent, 'Run Start'),
                    h('.p2', creationModel.formatRunStart()),
                ]),
                h(PanelComponent, [
                    h(LabelPanelHeaderComponent, 'Run End'),
                    h('.p2', creationModel.formatRunEnd()),
                ]),
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
                                        checked: Boolean(creationModel.isTimeBased),
                                        disabled: !startTime || !endTime,
                                        onchange: () => {
                                            creationModel.setIsTimeBased();
                                        },
                                        type: 'checkbox',
                                    },
                                ),
                                h('span.slider.round'),
                            ]),
                            isTimeBased ? h('.primary', 'Yes') : h('.warning', 'No'),
                        ]),
                    ),
                    timeBasedPanelBody(),
                ]),
            ]),
        ]),
        h(PanelComponent, { id: 'flag-type-panel' }, [
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
 * @param {MultipleQcFlagsCreationModel} creationModel model
 * @returns {Component} creation component
 */
export const multipleQcFlagsCreationComponent = (creationModel) => h(
    '.flex-column.g3.flex-grow',
    multipleQcFlagsCreationForm(creationModel),
);
