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
import errorAlert from '../../../components/common/errorAlert.js';

/**
 * A function to construct the create tag screen
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the inputs
 */
const createTagScreen = (model) => {
    const text = model.tags.getText();
    const data = model.tags.getCreatedTag();

    const disabled = text.length < 3 || text.length > 20 || data.isLoading();

    return h('div#create-log', [
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

            h('button.shadow-level1.btn.btn-success.mt2#send', {
                disabled,
                onclick: () => model.tags.createTag(),
            }, data.isLoading() ? 'Creating...' : 'Create'),
        ]),
    ]);
};

export default (model) => createTagScreen(model);
