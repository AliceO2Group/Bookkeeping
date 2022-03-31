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

import { h } from '/js/src/index.js';
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';

/**
 * A function to construct the create tag screen
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the inputs
 */
const createTagScreen = (model) => {
    const text = model.tags.getText();
    const data = model.tags.getCreatedTag();
    const mattermost = model.tags.getMattermost();
    const email = model.tags.getEmail();
    const disabled = text.length < 3 || text.length > 20 || data.isLoading();

    return h('div#create-tag', [
        data.isLoading() && spinner(),
        data.isFailure() && data.payload.map(errorAlert),
        h('', {
            onremove: () => model.tags.clearEditor(),
        }, [
            h('h2', 'Create Tag'),

            h('label.form-check-label.f4.mt2', { for: 'text' }, 'Text'),
            h('input#text.form-control.w-25.mb2', {
                placeholder: 'Enter the tag content...',
                minlength: 3,
                maxlength: 20,
                value: text,
                oninput: (e) => model.tags.setText(e.target.value),
            }, text),
            model.session?.access?.includes('admin') && [
                h('label.form-check-label.f4.mt2', { for: 'mattermost' }, 'Mattermost channels'),
                h('input#text.form-control.w-25.mb2', {
                    placeholder: 'Enter the mattermost channels... ("," seperation)',
                    value: mattermost,
                    oninput: (e) => model.tags.setMattermost(e.target.value),
                }, mattermost),

                h('label.form-check-label.f4.mt2', { for: 'email' }, 'Email lists'),
                h('input#text.form-control.w-25.mb2', {
                    placeholder: 'Enter the email groups... ("," seperation)',
                    value: email,
                    oninput: (e) => model.tags.setEmail(e.target.value),
                }, email),
            ],
            h('button.shadow-level1.btn.btn-success.mt2#send', {
                disabled,
                onclick: () => model.tags.createTag(),
            }, data.isLoading() ? 'Creating...' : 'Create'),
        ]),
    ]);
};

export default (model) => createTagScreen(model);
