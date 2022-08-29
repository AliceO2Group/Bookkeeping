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
    let runNumberText = '1234, 5678, 91011, ... ';

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
            h('.w-100.flex-row.mv2.justify-between', [
                h('h3', 'New log'),
                postLogPanel(model.logs, data, disabled),
            ]),
            h('.w-100.flex-row.g3', [
                h('.w-60.flex-column.g3', [
                    titlePanel(model.logs, title),
                    contentPanel(model.logs, text),
                ]),
                h('.w-40.flex-column.g3', [
                    runNumbersPanel(model, runNumberText, runNumbers),
                    attachementsPanel(model.logs, attachments),
                    tagsPanel(model),
                ]),

            ]),
        ]),
    ]);
};

/**
 * A function that creates a style for the labels of the panels
 * @param {string} labelOptions - Creates options for the label
 * @param {string} labelText - Creates text for the label
 * @param {content} content - Creates the content of the label
 * @returns {vnode} - Returns styled label
 */
const labeledInput = (labelOptions, labelText, content) => h('.w-100', [
    h(
        'label.form-check-label.f5.bg-gray-light.p2.header-panel',
        labelOptions,
        labelText,
    ),
    content,
]);

/**
 * Build a panel containing the title label and input field for user to provide a title
 * @param {LogModel} logs - Logs model
 * @param {string} title - Title to be saved for the log
 * @returns {vnode} - Title panel
 */
const titlePanel = (logs, title) => labeledInput (
    { for: 'title' },
    'Title*',
    h('input#title.form-control.bg', {
        placeholder: 'Enter the title of the log entry...',
        minlength: 3,
        maxlength: 140,
        value: title,
        oninput: (e) => logs.setTitle(e.target.value),
    }, title),

);

/**
 * Builds a panel containing the label and textarea for log content
 * @param {LogModel} logs - Logs model
 * @param {string} text - Content to be saved for the log
 * @returns {vnode} - Content panel
 */
const contentPanel = (logs, text) => labeledInput(
    { for: 'text' },
    'Content description*',
    h('.w-100.shadow-level1', markdownTextArea(logs, text)),
);

/**
 * Textarea which allows the user to type in Markdown language
 * @param {LogModel} logs - Logs model
 * @param {string} text - The text to be set to the preview
 * @returns {vnode} - The inputted panel
 */
const markdownTextArea = (logs, text) => labeledInput (
    { for: text },
    h('textarea#text.form-control', {
        placeholder: 'Your message...',
        disabled: true,
        onchange: (e) => logs.setText(e.target.value),
        oninit: () => {
            logs.setMarkdownBox('text', {
                location: 'logs',
                name: 'setText',
            }, { isReadOnly: false });
        },
    }, text),
);

/**
 * Builds a panel containing the label and input field for run numbers
 * @param {Object} model - General model
 * @param {string} runNumberText - Placeholder text for runNumber input field
 * @param {string} runNumbers - Input field for one or multiple run numbers, seperated by commas
 * @returns {vnode} - Panel allowing user to input run numbers
 */
const runNumbersPanel = ({ logs, router }, runNumberText, runNumbers) => labeledInput (
    { for: 'run-numbers' },
    'Run numbers',
    h('input#run-number.form-control', {
        placeholder: `${runNumberText}`,
        value: runNumbers,
        oninput: (e) => logs.setRunNumbers(e.target.value),
        disabled: Boolean(router.params.id),
    }),
);

/**
 * Builds a panel containing the label, display list of attached files, a file upload button
 * @param {LogModel} logs - Logs model
 * @param {FileList} attachments - attachments to be saved
 * @return {vnode} - panel allowing the user to attach files
 */
const attachementsPanel = (logs, attachments) => labeledInput (
    { for: 'attachments' },
    'Fileattachments',
    h('flex-column', [
        h('.flex-row.justify-between', [
            h('input#attachments.form-control.w-33', {
                type: 'file',
                multiple: true,
                onchange: (e) => logs.setAttachments(e.target.files),
            }),
            attachments.length > 0 && h('button#clearAttachments.btn.btn-danger.ml3', {
                onclick: () => logs.clearAttachments(),
            }, 'Clear'),
        ]),
        h('#attachmentNames', {
            style: 'min-height: 1.5em;',
        }, attachments.length > 1 && [...attachments].map((attachment) => attachment.name).join(', ')),
    ]),
);

/**
 * Builds a panel containing the label and tag picker for tags
 * @param {Object} model - general model
 * @returns {vnode} - panel allowing users to select tags
 */
const tagsPanel = ({ tags, logs }) => labeledInput (
    { for: 'title' },
    'Tags',
    remoteDataTagPicker(tags.getTags(), logs.creationTagsPickerModel),
);

/**
 * Builds a panel containing a post log button
 * @param {LogModel} logs - Logs model
 * @param {RemoteData} data - remote data object of the log to be created
 * @param {boolean} disabled - state of the button
 * @returns {vnode} - panel containing the button allowing the user to create a log
 */
const postLogPanel = (logs, data, disabled) =>
    h('button.btn.btn-success#send.w-20', {
        disabled,
        onclick: () => logs.createLog(),
    }, data.isLoading() ? 'Creating...' : 'Post log');

export default (model) => createLogScreen(model);
