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

/**
 * A function to construct the create log screen
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the inputs
 */
const createScreen = (model) => {
    const title = model.logs.getTitle();
    const text = model.logs.getText();
    const disabled = !(title.length > 2 && text.length > 2);
    const data = model.logs.getCreatedLog();

    return h('div#create-log', [
        data.isFailure() && data.payload.map((error) =>
            h('.alert.alert-danger', h('b', `${error.title}: `), error.detail)),
        h('', [
            h('h3.black.line-break: auto', 'Title of the log'),
            h('input#title', {
                placeholder: 'Enter the title of the log entry...',
                minlength: 3,
                maxlength: 140,
                value: title,
                oninput: (e) => model.logs.setTitle(e.target.value),
            }, title),
        ]),
        h('', [
            h('h3.black.line-break: auto', 'Text'),
            h('textarea#text.w-75.form-control', {
                placeholder: 'Your message...',
                minlength: 3,
                rows: 5,
                oninput: (e) => model.logs.setText(e.target.value),
            }, text),
        ]),
        h('button.btn.btn-success.m#send', {
            onclick: () => model.logs.createLog(),
            disabled,
        }, 'Create'),
    ]);
};

export default (model) => [createScreen(model)];
