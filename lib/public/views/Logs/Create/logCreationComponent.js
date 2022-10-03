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
import { remoteDataTagPicker } from '../../../components/tag/remoteDataTagPicker.js';
import { markdownInput } from '../../../components/common/markdown/markdown.js';
import spinner from '../../../components/common/spinner.js';

/**
 * A function to construct the create log screen
 *
 * @param {LogCreationModel} creationModel - Log creation model
 * @param {RemoteData} availableTags remote data of available tags that can be linked to the created log
 * @return {vnode} the log creation component
 */
export const logCreationComponent = (creationModel, availableTags) => {
    const data = creationModel.createdLog;

    return h('div#create-log', [
        data.isFailure() && data.payload.map(errorAlert),
        creationModel.parentLog.match({
            NotAsked: () => errorAlert([{ title: 'Missing parent log' }]),
            Loading: () => spinner(),
            Success: () => logCreationForm(creationModel, availableTags),
            Failure: (errors) => errorAlert(errors),
        }),
    ]);
};

/**
 * Returns the component containing the log creation form
 *
 * @param {LogCreationModel} creationModel the creation model
 * @param {RemoteData} availableTags remote data of available tags that can be linked to the created log
 * @return {vnode} the form component
 */
const logCreationForm = (creationModel, availableTags) => h('div.flex-column', [
    h('.w-100.flex-row.mv2.justify-between', [
        h('h3', 'New log'),
        postLogPanel(creationModel),
    ]),
    h('.w-100.flex-row.g3', [
        h('.w-60.flex-column.g3', [
            titlePanel(creationModel),
            contentPanel(creationModel),
        ]),
        h('.w-40.flex-column.g3', [
            runNumbersPanel(creationModel),
            attachmentsPanel(creationModel),
            tagsPanel(creationModel, availableTags),
        ]),
    ]),
]);

/**
 * A function that creates a style for the labels of the panels
 * @param {Object} labelOptions - Creates options for the label
 * @param {string} labelText - Creates text for the label
 * @param {*} content - Creates the content of the label
 * @returns {vnode} - Returns styled label
 */
const labeledInput = (labelOptions, labelText, content) => h('.w-100', [
    labelText && h(
        'label.form-check-label.f5.bg-gray-light.p2.header-panel',
        labelOptions,
        labelText,
    ),
    content,
]);

/**
 * Build a panel containing the title label and input field for user to provide a title
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - Title panel
 */
const titlePanel = (logCreationModel) => labeledInput(
    { for: 'title' },
    'Title*',
    h('input#title.form-control.bg', {
        placeholder: 'Enter the title of the log entry...',
        minlength: 3,
        maxlength: 140,
        value: logCreationModel.title,
        oninput: (e) => {
            logCreationModel.title = e.target.value;
        },
    }),
);

/**
 * Builds a panel containing the label and textarea for log content
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - Content panel
 */
const contentPanel = (logCreationModel) => labeledInput(
    { for: 'text' },
    'Content description*',
    h('.w-100.form-control', markdownTextArea(logCreationModel)),
);

/**
 * Textarea which allows the user to type in Markdown language
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - The inputted panel
 */
const markdownTextArea = (logCreationModel) => labeledInput(
    { for: 'text' },
    null,
    markdownInput(
        logCreationModel.text,
        {
            id: 'text',
            placeholder: 'Your message...',
            onchange: (e) => {
                logCreationModel.text = e.target.value;
            },
        },
        (editor) => {
            logCreationModel.textEditor = editor;
        },
        { height: '40rem' },
    ),
);

/**
 * Builds a panel containing the label and input field for run numbers
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - Panel allowing user to input run numbers
 */
const runNumbersPanel = (logCreationModel) => labeledInput(
    { for: 'run-numbers' },
    'Run numbers',
    h('input#run-number.form-control', {
        placeholder: '1234, 5678, 91011, ... ',
        value: logCreationModel.runNumbers,
        oninput: (e) => {
            logCreationModel.runNumbers = e.target.value;
        },
        disabled: logCreationModel.isRunNumbersReadonly,
    }),
);

/**
 * Builds a panel containing the label, display list of attached files, a file upload button
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @return {vnode} - panel allowing the user to attach files
 */
const attachmentsPanel = (logCreationModel) => {
    const { attachments } = logCreationModel;

    return labeledInput(
        { for: 'attachments' },
        'File attachments',
        h('flex-column', [
            h('.flex-row.justify-between', [
                h('input#attachments.form-control.w-33', {
                    type: 'file',
                    multiple: true,
                    onchange: (e) => {
                        logCreationModel.attachments = e.target.files;
                    },
                }),
                attachments.length > 0 && h('button#clearAttachments.btn.btn-danger.ml3', {
                    onclick: () => logCreationModel.clearAttachments(),
                }, 'Clear'),
            ]),
            h('#attachmentNames', {
                style: 'min-height: 1.5em;',
            }, attachments.length > 1 && [...attachments].map((attachment) => attachment.name).join(', ')),
        ]),
    );
};

/**
 * Builds a panel containing the label and tag picker for tags
 * @param {LogCreationModel} logCreationModel - Log creation model
 * @param {RemoteData} availableTags remote data of available tags that can be linked to the created log
 * @returns {vnode} - panel allowing users to select tags
 */
const tagsPanel = (logCreationModel, availableTags) => {
    const tagsCount = logCreationModel.tagsPickerModel.selected.length;

    return labeledInput(
        { for: 'title' },
        `Tags (${tagsCount} selected)`,
        remoteDataTagPicker(availableTags, logCreationModel.tagsPickerModel),
    );
};

/**
 * Builds a panel containing a post log button
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - panel containing the button allowing the user to create a log
 */
const postLogPanel = (logCreationModel) => {
    const disabled = !(logCreationModel.isReady
                       && logCreationModel.isValid
                       && !logCreationModel.createdLog.isLoading());

    return h('button.btn.btn-success#send.w-20', {
        disabled,
        onclick: () => logCreationModel.submit(),
    }, logCreationModel.createdLog.isLoading() ? 'Creating...' : 'Post log');
};
