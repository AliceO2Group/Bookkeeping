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
import { getRunNotSubjectToQcReason, isRunNotSubjectToQc } from '../../../components/qcFlags/isRunSubjectToQc.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

/**
 * Create table with selected detectors and runs information
 * @param {QcFlagCreationModel} creationModel model
 * @return {Component} table component
 */
const selectedInfoTable = (creationModel) => h(PanelComponent, [
    h(LabelPanelHeaderComponent, 'Selected Detectors/Runs'),
    h('table.table.table-sm', [
        h('thead', [
            h('tr', [
                h('th', 'Run'),
                h('th', 'Detectors'),
                h('th', 'Start Time'),
                h('th', 'End Time'),
            ]),
        ]),
        creationModel.runs.match({
            Success: (runs) => h('tbody', Object.entries(creationModel.dplDetectors._payload).map(([runNumber, detectors]) => {
                const run = runs.find((r) => r.runNumber === parseInt(runNumber, 10));
                return h('tr', [
                    h('td', frontLink(runNumber, 'run-detail', { runNumber })),
                    h('td', detectors.map((detector) => detector.name).join(', ')),
                    h('td', formatRunStart(run, false)),
                    h('td', formatRunEnd(run, false)),
                ]);
            })),
            Other: () => [],
        }),
    ]),
]);

/**
 * Render the creation form of QC flag
 *
 * @param {QcFlagCreationModel} creationModel the creation model
 * @return {Component} the component
 */
const qcFlagCreationForm = (creationModel) => {
    const { timeRangeModel, isTimeBasedQcFlag, startTime, endTime } = creationModel;

    /**
     * Create QC flag timestamp inputs if model is in time-based mode
     * @param {Run} run run
     * @return {Component} QC flag timestamp inputs
     */
    const timeBasedPanelBody = () => {
        let content;
        if (!endTime || !startTime) {
            content = h('em', 'Missing start/stop, the flag will be applied on the full run');
        } else if (startTime > endTime) {
            content = h('em', "The selected runs don't have overlapping start/stop times");
        } else if (isTimeBasedQcFlag) {
            content = timeRangeInput(timeRangeModel, { seconds: true, min: startTime, max: endTime });
        } else {
            content = h('em', 'The flag will be applied on the full run');
        }

        return h('.ph3.pv2', content);
    };

    return [
        h('.flex-column.g3', [
            h('.flex-row.items-start.g3', [
                creationModel.runs.match({
                    Success: () => selectedInfoTable(creationModel),
                    NotAsked: () => null,
                    Loading: () => spinner({ absolute: false }),
                    Failure: (errors) => errorAlert(errors),
                }),

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
                                        // If times dont overlap, the startTime will be larger than endTime
                                        disabled: !startTime || !endTime || startTime > endTime,
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
 * @param {QcFlagCreationModel} creationModel model
 * @returns {Component} creation component
 */
export const qcFlagCreationComponent = (creationModel) => h(
    '.flex-column.g3.flex-grow',
    creationFormComponent(creationModel, [
        creationModel.runs.match({
            Success: (runs) => runs.every(isRunNotSubjectToQc)
                ? runs.map((run) => errorAlert([{ title: getRunNotSubjectToQcReason(run) }]))
                : qcFlagCreationForm(creationModel),
            Loading: () => spinner({ absolute: false }),
            Failure: (errors) => errorAlert(errors),
            NotAsked: () => null,
        }),
    ]),
);
