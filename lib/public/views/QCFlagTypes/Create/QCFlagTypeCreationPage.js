/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h, sessionService } from '/js/src/index.js';
import { BkpRoles } from '../../../domain/enums/BkpRoles.js';
import { creationFormComponent } from '../../../components/common/form/creationFormComponent.js';
import { colorInputComponent } from '../../../components/common/form/inputs/colorInputComponent.js';
import { PanelComponent } from '../../../components/common/panel/PanelComponent.js';
import { LabelPanelHeaderComponent } from '../../../components/common/panel/LabelPanelHeaderComponent.js';

/**
 * A function to construct the create tag screen
 * @param {TagCreationModel} tagCreationModel Pass the model to access the defined functions
 * @return {vnode} Return the view of the inputs
 */
const qcFlagTypeCreationForm = ({ data }) => {
    const { name, method, color, bad } = data;

    const panel = [
        h(PanelComponent, [
            h(LabelPanelHeaderComponent, { for: 'name' }, 'Name'),
            h('input#name.form-control.mb2', {
                placeholder: 'Enter the QC Flag Type name...',
                minlength: 1,
                maxlength: 50,
                value: name,
                oninput: (e) => {
                    data.name = e.target.value;
                },
            }),
        ]),
        h(
            PanelComponent,
            [
                h(LabelPanelHeaderComponent, { for: 'method' }, 'Method'),
                h('input#method.form-control.mb2', {
                    placeholder: 'Enter the QC Flag Type method...',
                    value: method,
                    minlength: 1,
                    maxlength: 100,
                    oninput: (e) => {
                        data.method = e.target.value;
                    },
                }),
            ],
        ),
        h(PanelComponent, [
            h(LabelPanelHeaderComponent, { for: 'bad' }, 'Is bad'),
            h(
                'label.flex-row.g1.items-center',
                [
                    h('.switch#bad-toggle', [
                        h(
                            'input',
                            {
                                checked: Boolean(bad),
                                onchange: () => {
                                    data.bad = !bad;
                                },
                                type: 'checkbox',
                            },
                        ),
                        h('span.slider.round'),
                    ]),
                    bad ? h('.danger', 'Yes') : h('.success', 'No'),
                ],
            ),
        ]),

        h(PanelComponent, [
            h(LabelPanelHeaderComponent, { for: 'color' }, 'Color'),
            h('label.f5.mb2', 'Please fill in a hexadecimal color after the #'),
            colorInputComponent(color, (color) => {
                data.color = color;
            }),
        ]),
    ];

    return h('.w-25', panel);
};

/**
 * Returns the tag creation page
 *
 * @param {Model} model the tag creation model
 * @return {vnode} the tag creation page
 */
export const QCFlagTypeCreationPage = ({ qcFlagTypes: { creationModel } }) => h(
    '',
    { onremove: () => creationModel.reset() },
    [
        h('h2', 'QC Flag Type Creation'),
        sessionService.hasAccess(BkpRoles.ADMIN)
            ? creationFormComponent(creationModel, qcFlagTypeCreationForm(creationModel))
            : h('', 'Admin only'),
    ],
);
