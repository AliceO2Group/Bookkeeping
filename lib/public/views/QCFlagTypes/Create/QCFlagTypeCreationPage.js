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

/**
 * A function to construct the create tag screen
 * @param {TagCreationModel} tagCreationModel Pass the model to access the defined functions
 * @return {vnode} Return the view of the inputs
 */
const qcFlagTypeCreationForm = ({ data }) => {
    const { name, method, bad, color } = data;

    return [
        h('label.form-check-label.f4.mt2', { for: 'name' }, 'Name'),
        h('input#text.form-control.w-25.mb2', {
            placeholder: 'Enter the QC Flag Type name...',
            minlength: 2,
            maxlength: 20,
            value: name,
            oninput: (e) => {
                data.name = e.target.value;
            },
        }),
        h('label.form-check-label.f4.mt2', { for: 'method' }, 'Method'),
        h('textarea#method.v-resize.form-control.w-25.mb2', {
            placeholder: 'Enter the QC Flag Type method...',
            value: method,
            maxlength: 100,
            oninput: (e) => {
                data.method = e.target.value;
            },
        }),

        // h('label.form-check-label.f4.mt2', { for: 'email' }, 'Email lists'),
        // h('input#email.form-control.w-25.mb2', {
        //     placeholder: 'Enter the email groups...',
        //     value: email,
        //     oninput: (e) => {
        //         data.email = e.target.value;
        //     },
        // }),

        h('label.form-check-label.f4.mt2', { for: 'color' }, 'Color'),
        h('label.f5.mb2', 'Please fill in a hexadecimal color after the #'),
        colorInputComponent(color, (color) => {
            data.color = color;
        }),
    ];
};

/**
 * Returns the tag creation page
 *
 * @param {Model} model the tag creation model
 * @return {vnode} the tag creation page
 */
export default ({ qcFlagTypes: { creationModel } }) => h(
    '',
    { onremove: () => creationModel.reset() },
    [
        h('h1', 'Create QC Flag Type'),
        sessionService.hasAccess(BkpRoles.ADMIN)
            ? creationFormComponent(creationModel, qcFlagTypeCreationForm(creationModel))
            : h('', 'Admin only'),
    ],
);
