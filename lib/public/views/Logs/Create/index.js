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
 * Render the preview component
 * @param {Object} model The model object
 * @param {String} text The text to be set to the preview
 * @returns {vnode} returns the preview node
 */
const mdBox = (model, text) => h('', {
    onremove: () => model.logs.flushModel(),
}, [
    h('textarea#text.form-control', {
        placeholder: 'Your message...',
        disabled: true,
        onchange: (e) => model.logs.setText(e.target.value),
        oninit: () => {
            model.logs.setMarkdownBox('text', { location: 'logs', name: 'setText' }, { isReadOnly: false });
        },
    }, text),
]);

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

    if (model.router.params.parentLogId) {
        model.logs.parentLogId = parseInt(model.router.params.parentLogId, 10);
    } else {
        model.logs.parentLogId = -1;
    }

    return h('div#create-log', [
        data.isFailure() && data.payload.map(errorAlert),
        h('', [
            h('h2.mv2', 'Create Log'),
            h('h3.black.line-break: auto', 'Title of the log'),
            h('input#title', {
                placeholder: 'Enter the title of the log entry...',
                minlength: 3,
                maxlength: 140,
                value: title,
                oninput: (e) => model.logs.setTitle(e.target.value),
            }, title),
        ]),
        h('h3.black.line-break: auto', 'Text'),
        h('.shadow-level2.w-100', mdBox(model, text)),
        h('button.mv2.shadow-level1.btn.btn-success.m#send', {
            onclick: () => model.logs.createLog(),
            disabled,
        }, 'Create'),
    ]);
};

export default (model) => [createScreen(model)];
