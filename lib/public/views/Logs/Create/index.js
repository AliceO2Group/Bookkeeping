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
import { remoteDataTagPicker } from '../../../components/pickers/tag/remoteDataTagPicker.js';

/**
 * Render the preview component
 * @param {Object} model The model object
 * @param {String} text The text to be set to the preview
 * @returns {vnode} returns the preview node
 */
const mdBox = (model, text) => h('', [
    h('textarea#text.form-control', {
        placeholder: 'Your message...',
        disabled: true,
        onchange: (e) => model.logs.setText(e.target.value),
        oninit: () => {
            model.logs.setMarkdownBox('text', {
                location: 'logs',
                name: 'setText',
            }, { isReadOnly: false });
        },
    }, text),
]);

/**
 * A function to construct the create log screen
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the inputs
 */
const createLogScreen = (model) => {
    const title = model.logs.getTitle();
    const text = model.logs.getText();
    const attachments = model.logs.getAttachments();
    const runNumber = model.router.params.id;
    let runNumbers = model.logs.getRunNumbers();
    let runNumberText = 'One or multiple run numbers, separated by commas.';

    const data = model.logs.getCreatedLog();

    let disabled = !(title.length >= 3 && text.length >= 3) || data.isLoading();

    if (model.router.params.parentLogId) {
        model.logs.setParentLogId(parseInt(model.router.params.parentLogId, 10));
        disabled = !((title.length >= 3 || title.length == 0) && text.length >= 3) || data.isLoading();
    } else {
        model.logs.setParentLogId(-1);
    }

    if (runNumber && model.logs.getRunNumbers() != runNumber) {
        runNumbers = runNumber;
        model.logs.setRunNumbers(runNumbers);
        runNumberText = 'One run number.';
    }

    return h('div#create-log', [
        data.isFailure() && data.payload.map(errorAlert),
        h('', {
            onremove: () => model.logs.clearAllEditors(),
        }, [
            h('h2', 'Create Log'),

            h('label.form-check-label.f4.mt2', { for: 'title' }, 'Title'),
            h('input#title.form-control.w-100', {
                placeholder: 'Enter the title of the log entry...',
                minlength: 3,
                maxlength: 140,
                value: title,
                oninput: (e) => model.logs.setTitle(e.target.value),
            }, title),

            h('label.form-check-label.f4.mt2', { for: 'text' }, 'Text'),
            h('.shadow-level2.w-100', mdBox(model, text)),

            h('label.form-check-label.f4.mt2', { for: 'run-number' }, 'Run numbers (optional)'),
            h('input#run-number.form-control.w-100', {
                placeholder: `${runNumberText}`,
                value: runNumbers,
                oninput: (e) => model.logs.setRunNumbers(e.target.value),
                disabled: Boolean(model.router.params.id),
            }),

            h('label.form-check-label.f4.mt3', { for: 'tags' }, 'Tags (optional)'),
            h('label.form-check-label.f6', { for: 'tags' }, 'Add one or multiple tags to the log. '),
            remoteDataTagPicker(model.tags.getTags(), model.logs.creationTagsPickerModel),
            h('label.form-check-label.f4.mt2', { for: 'attachments' }, 'File attachments (optional)'),
            h('label.form-check-label.f6', { for: 'attachments' }, 'You may select multiple files to upload.'),
            h('.flex-row.justify-between', [
                h('input#attachments.form-control', {
                    type: 'file',
                    multiple: true,
                    onchange: (e) => model.logs.setAttachments(e.target.files),
                }),
                attachments.length > 0 && h('button#clearAttachments.btn.btn-danger.ml3', {
                    onclick: () => model.logs.clearAttachments(),
                }, 'Clear'),
            ]),
            h('#attachmentNames', {
                style: 'min-height: 1.5em;',
            }, attachments.length > 1 && [...attachments].map((attachment) => attachment.name).join(', ')),

            h('button.shadow-level1.btn.btn-success.mt2#send', {
                disabled,
                onclick: () => model.logs.createLog(),
            }, data.isLoading() ? 'Creating...' : 'Create'),
        ]),
    ]);
};

export default (model) => createLogScreen(model);
