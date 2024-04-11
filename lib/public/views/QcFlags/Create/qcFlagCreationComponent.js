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

/**
 * Create panel with input forms for quality control flag creation
 * @param {QualityControlFlagCreationModel} creationModel model
 * @return {Component} panel
 */
const qcFlagCreationForm = (creationModel) => {
    const rightPanel = [
        h(PanelComponent, [
            h(LabelPanelHeaderComponent, { for: 'flag-type' }, 'Flag Type'),
            selectionDropdown(
                creationModel.flagTypesSelectionModel,
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
                    // { height: '100%' },
                    { height: '30rem' },
                ),
            ],
        ),
    ];

    const leftPanel = [
        h(
            PanelComponent,
            [
                h(LabelPanelHeaderComponent, 'Time Start'),
                // creationModel.fromTimeModel ? dateTimeInput(creationModel.fromTimeModel) : null,

            ],
        ),
        h(
            PanelComponent,
            [
                h(LabelPanelHeaderComponent, 'Time End'),
                // creationModel.toTimeModel ? dateTimeInput(creationModel.toTimeModel) : null,

            ],
        ),
    ];

    return [
        h('.flex-row.g3.flex-grow', [
            h('.w-40.flex-column.g3', rightPanel),
            h('.w-60.flex-column.g3', leftPanel),
        ]),
    ];
};

/**
 * Render QC Flags creation component
 * @param {QcFlagCreationModel} creationModel QC flag creation model
 * @returns {Component} creation component
 */
export const qcFlagCreationComponenet = (creationModel) =>
    creationFormComponent(h('.w-100.flex-column', [qcFlagCreationForm(creationModel)]));
