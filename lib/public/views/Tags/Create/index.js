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

/**
 * A function to construct the create tag screen
 * @param {TagCreationModel} tagCreationModel Pass the model to access the defined functions
 * @return {vnode} Return the view of the inputs
 */
const tagCreationForm = ({ data }) => {
    const { text, description, email, mattermost } = data;

    return [
        h('label.form-check-label.f4.mt2', { for: 'text' }, 'Text'),
        h('input#text.form-control.w-25.mb2', {
            placeholder: 'Enter the tag content...',
            minlength: 2,
            maxlength: 20,
            value: text,
            oninput: (e) => {
                data.text = e.target.value;
            },
        }),
        h('label.form-check-label.f4.mt2', { for: 'description' }, 'Description'),
        h('textarea#description.form-control.w-25.mb2', {
            placeholder: 'Enter the description of the tag?...',
            value: description,
            oninput: (e) => {
                data.description = e.target.value;
            },
        }),
        h('label.f4.mt3.mb1', 'Tags should inform below channels and groups on log creation:'),
        h('label.f5.mb2', 'For multiple fields split by comma separation'),
        h('label.form-check-label.f4.mt2', { for: 'mattermost' }, 'Mattermost channels'),
        h('input#mattermost.form-control.w-25.mb2', {
            placeholder: 'Enter the mattermost channels...',
            value: mattermost,
            oninput: (e) => {
                data.mattermost = e.target.value;
            },
        }),

        h('label.form-check-label.f4.mt2', { for: 'email' }, 'Email lists'),
        h('input#email.form-control.w-25.mb2', {
            placeholder: 'Enter the email groups...',
            value: email,
            oninput: (e) => {
                data.email = e.target.value;
            },
        }),
    ];
};

/**
 * Returns the tag creation page
 *
 * @param {Model} model the tag creation model
 * @return {vnode} the tag creation page
 */
export default ({ tags: { creationModel } }) => h(
    '',
    { onremove: () => creationModel.reset() },
    [
        h('h1', 'Create Tag'),
        sessionService.hasAccess(BkpRoles.ADMIN)
            ? creationFormComponent(creationModel, tagCreationForm(creationModel))
            : h('', 'Admin only'),
    ],
);
