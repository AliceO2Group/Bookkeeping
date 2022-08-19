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
    let runNumberText = '1234, 5678, 91011, ..... ';

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
        h('div.flex-column', {
            onremove: () => model.logs.clearAllEditors(),
        }, [
            h('.w-100.flex-row.mv2', {
                style: 'justify-content: space-between',
            }, [
                h('h3', 'New log'),
                postLogPanel(model, data, disabled),
            ]),
            h('.w-100.flex-row.g3', [
                h('.w-60.flex-column.g3', [
                    titlePanel(model, title),
                    contentPanel(model, text),
                ]),
                h('.w-40.flex-column.g3', [
                    runNumbersPanel(model, runNumberText, runNumbers),
                    attachementsPanel(model, attachments),
                    tagsPanel(model),
                ]),

            ]),
        ]),
    ]);
};

/**
 * Build a panel containing the title label and input field for user to provide title
 * @param {Object} model - General model
 * @param {string} title - title to be saved for the log
 * @returns {vnode} - title panel
 */
const titlePanel = (model, title) =>
    h('.w-100', [
        h('label.form-check-label.f5.bg-gray-light.p2.header-panel', { for: 'title' }, 'Title*'),
        h('input#title.form-control.bg', {
            placeholder: 'Enter the title of the log entry...',
            minlength: 3,
            maxlength: 140,
            value: title,
            oninput: (e) => model.logs.setTitle(e.target.value),
            style: 'border-radius:0;',
        }, title),
    ]);

/**
 * Builds a panel containing the label and textarea for log content
 * @param {Object} model - General model
 * @param {string} text - content to be saved for the log
 * @returns {vnode} - content panel
 */
const contentPanel = (model, text) =>
    h('.w-100', [
        h('label.form-check-label.f5.bg-gray-light.p2.header-panel', { for: 'text' }, 'Content description*'),
        h('.w-100.shadow-level1', mdBox(model, text)),
    ]);

/**
 * Builds a panel containing the label and input field for run numbers
 * @param {Object} model - General model
 * @param {string} runNumberText - Placeholder text for runnumber input field
 * @param {string} runNumbers - Input field for one or multiple run numbers, seperated by commas
 * @returns {vnode} - vnode
 */
const runNumbersPanel = (model, runNumberText, runNumbers) =>
    h('.w-100', [
        h('label.form-check-label.f5.bg-gray-light.p2.header-panel', { for: 'run-number' }, 'Run numbers'),
        h('input#run-number.form-control', {
            placeholder: `${runNumberText}`,
            value: runNumbers,
            oninput: (e) => model.logs.setRunNumbers(e.target.value),
            disabled: Boolean(model.router.params.id),
        }),
    ]);

/**
 * Builds a panel containing the label and a file upload button
 * @param {Object} model - general model
 * @param {files} attachments - file upload button
 * @returns {vnode} - vnode
 */
const attachementsPanel = (model, attachments) =>
    h('.w-100.flex-column', [
        h('label.form-check-label.f5.bg-gray-light.p2.header-panel', { for: 'attachments' }, 'File attachments'),
        h('.flex-row.justify-between', [
            h('input#attachments.form-control.w-33', {
                type: 'file',
                multiple: true,
                onchange: (e) => model.logs.setAttachments(e.target.files),
            }),
            attachments.length > 0 && h('button#clearAttachments.btn.btn-danger.ml3', {
                onclick: () => model.logs.clearAttachments(),
            }, 'Clear'),
        ]),
        attachments.length > 1 && h('#attachmentNames', {
            style: 'min-height: 1.5em;',
        }, [...attachments].map((attachment) => attachment.name).join(', ')),
    ]);

/**
 * Builds a panel containing the label and tag picker for tags
 * @param {Object} model - general model
 * @returns {vnode} - vnode
 */
const tagsPanel = (model) =>
    h('div.w-100', [
        h('label.form-check-label.f5.bg-gray-light.p2.header-panel', { for: 'tags' }, 'Tags'),
        h('label.form-check-label.f7', { for: 'tags' }, 'Add tag(s) to the log. '),
        remoteDataTagPicker(model.tags.getTags(), model.logs.creationTagsPickerModel),
    ]);

/**
 * Builds a panel containing a post log button
 * @param {Object} model - general model
 * @param {any} data - ? **question for George**
 * @param {any} disabled - ? **question for George**
 * @returns {vnode} - vnode
 */
const postLogPanel = (model, data, disabled) =>
    h('button.btn.btn-success#send.w-20', {
        disabled,
        onclick: () => model.logs.createLog(),
    }, data.isLoading() ? 'Creating...' : 'Post log');

export default (model) => createLogScreen(model);
