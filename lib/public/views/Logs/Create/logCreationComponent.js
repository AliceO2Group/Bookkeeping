/**
 *
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
import { tagPicker } from '../../../components/tag/tagPicker.js';
import { markdownInput } from '../../../components/common/markdown/markdown.js';
import spinner from '../../../components/common/spinner.js';
import { logComponent } from '../../../components/Log/log.js';
import { popover } from '../../../components/common/popover/popover.js';
import { PopoverAnchors } from '../../../components/common/popover/PopoverEngine.js';
import { PopoverTriggerPreConfiguration } from '../../../components/common/popover/popoverPreConfigurations.js';

/**
 * A function to construct the create log screen
 *
 * @param {LogCreationModel} creationModel - Log creation model
 * @param {Object} options component creation options
 * @param {string} [options.authenticationToken] token to authenticate the session with the api
 * @param {Object} [options.parentLogMarkdownDisplayOptions] markdown display options @see logText options argument
 * @return {vnode} the log creation component
 */
export const logCreationComponent = (creationModel, options) => {
    const data = creationModel.createdLog;
    return [
        data.isFailure() && data.payload.map(errorAlert),
        creationModel.parentLog.match({
            NotAsked: () => errorAlert([{ title: 'Missing parent log' }]),
            Loading: () => spinner(),
            Success: (parentLog) => logCreationForm(creationModel, parentLog, options),
            Failure: (errors) => errorAlert(errors),
        }),
    ];
};

/**
 * Returns the component containing the log creation form
 *
 * @param {LogCreationModel} creationModel the creation model
 * @param {Log|null} parentLog - The parent of the log being created
 * @param {Object} options component creation options
 * @param {string} [options.authenticationToken] token to authenticate the session with the api
 * @param {Object} [options.parentLogMarkdownDisplayOptions] markdown display options @see logText options argument
 * @return {vnode} the form component
 */
const logCreationForm = (creationModel, parentLog, options) => [
    h('.w-100.flex-row.mv2.justify-between', [
        h('.f3.flex-row.g2', [
            parentLog
                ? [
                    'Reply to: ',
                    h('strong', parentLog.title),
                ]
                : 'New log',

        ]),
        postLogPanel(creationModel),
    ]),
    h('.w-100.flex-row.g3.flex-grow', [
        h('.w-60.flex-column.g3', [
            parentLog === null
                ? titlePanel(creationModel)
                : logComponent(
                    parentLog,
                    false,
                    false,
                    creationModel.isParentLogCollapsed,
                    creationModel.showCopyUrlSuccessContent,
                    () => creationModel.collapseParentLog(),
                    () => creationModel.showFullParentLog(),
                    () => creationModel.onCopyUrlSuccess(),
                    { ...options,
                        logMarkdownDisplayOpts: options.parentLogMarkdownDisplayOptions,
                        goToDetailsButton: true,
                        replayButton: false,
                    },
                ),

            contentPanel(creationModel),
        ]),
        h('.w-40.flex-column.g3', [
            runNumbersPanel(creationModel),
            environmentsPanel(creationModel),
            lhcFillsPanel(creationModel),
            attachmentsPanel(creationModel),
            tagsPanel(creationModel),
        ]),
    ]),
];

/**
 * A function that creates a style for the labels of the panels
 * @param {Object} labelAttributes - Attributes for the label component
 * @param {string} labelText - Creates text for the label
 * @param {*} content - Creates the content of the label
 * @param {Object} [containerAttributes] - Attributes for the component wrapping the label and its content
 * @returns {vnode} - Returns styled label
 */
const labeledInput = (labelAttributes, labelText, content, containerAttributes) => {
    containerAttributes = containerAttributes || {};
    return h(
        '.panel',
        {
            ...containerAttributes,
            class: ['w-100', containerAttributes.class].filter((className) => Boolean(className)).join(' '),
        },
        [
            labelText && h(
                'label.form-check-label.panel-header',
                labelAttributes,
                labelText,
            ),
            content,
        ],
    );
};

/**
 * Build a panel containing the title label and input field for user to provide a title
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - Title panel
 */
const titlePanel = (logCreationModel) => labeledInput(
    { for: 'title' },
    'Title',
    h('input#title.form-control.panel-body.bg', {
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
    markdownTextArea(logCreationModel),
    { class: 'flex-column flex-grow' },
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
            // eslint-disable-next-line no-return-assign
            oninput: (e) => logCreationModel.text = e.target.value,
        },
        (editor) => {
            logCreationModel.textEditor = editor;
        },
        { height: '100%' },
    ),
    { class: 'flex-column flex-grow' },
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
 * Builds a panel containing the label and input field for lhc fill numbers
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - Panel allowing user to input lhc fill numbers
 */
const lhcFillsPanel = (logCreationModel) => labeledInput(
    { for: 'lhc-fills' },
    'LHC Fills',
    h('input#lhc-fills.form-control', {
        placeholder: '1234, 5678, 91011, ... ',
        value: logCreationModel.lhcFills,
        oninput: (e) => {
            logCreationModel.lhcFills = e.target.value;
        },
    }),
);

/**
 * Builds a panel containing the label and input field for environment IDs
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - Panel allowing user to input environment IDs
 */
const environmentsPanel = (logCreationModel) => labeledInput(
    { for: 'environments' },
    'Environment IDs',
    h('input#environments.form-control', {
        placeholder: 'e.g. Dxi029djX, TDI59So3d...',
        value: logCreationModel.environments,
        oninput: (e) => {
            logCreationModel.environments = e.target.value;
        },
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
        h('.flex-column.p2.g2', [
            h('.flex-row.justify-between.items-center', [
                h('label', {
                    for: 'attachments',
                    style: 'display: flex; align-items: center; width: -webkit-fill-available;',
                }, [
                    h('.btn', 'Choose files'),
                    h('', {style: 'margin-left: 1%;'}, [
                        attachments.length === 0 && h('', 'No files chosen'),
                        attachments.length === 1 && h('', `${attachments.length} file chosen`),
                        attachments.length > 1 && h('', `${attachments.length} files chosen`),
                    ]),
                ]),
                h('input#attachments.w-33', {
                    type: 'file',
                    multiple: true,
                    style: 'visibility: hidden;',
                    onchange: (e) => {
                        logCreationModel.attachments = e.target.files;
                    },
                }),
                attachments.length > 0 && h('button#clearAttachments.btn.btn-danger.ml3', {
                    onclick: () => logCreationModel.clearAttachments(),
                }, 'Clear'),
            ]),
            attachments.length > 0 && h('#attachmentNames', {
                style: 'min-height: 1.5em;',
            }, [...attachments].map((attachment) => [
                showFilePreview(attachment, logCreationModel)
            ])),
        ]),
    );
};

const showFilePreview = (attachment, logCreationModel) => {
    let previewFileTypes = {
        image: false,
        json: false,
        csv: false,
        shellscript: false,
        text: false, // For all text file types left
    };

    console.log(attachment.type)

    for (let key in previewFileTypes) {
        if (attachment.type.match(key)) {
            previewFileTypes[key] = true;
        }
    }

    const fileButton = (style = '') => h('span.attachment', {
            key: attachment.name,
            style,
        }, [attachment.name, h('br')]
    );

    const previewPopover = (content) => popover(
        fileButton('text-decoration: underline; cursor: pointer;'),
        h('', {
            style: 'margin: 1%; max-height: 99%; overflow: hidden; display: flex; flex-direction: column;',
        }, [
            h('.f3', {}, attachment.name),
            h('', {
                style: 'overflow: auto;',
            }, content),
        ]),
        {
            ...PopoverTriggerPreConfiguration.click,
            anchor: PopoverAnchors.LEFT_MIDDLE,
        },
    );

    const previewFileStyle = 'margin: 0; width: 100%'

    if (previewFileTypes.image) {

        const reader = new FileReader();
        const fileContent = h('img', {
            alt: attachment.name,
            style: previewFileStyle,
            src: logCreationModel.getAttachmentPreview(attachment.name),
        });

        reader.onload = () => {
            logCreationModel.setAttachmentPreview(reader.result, attachment.name);
        };
        reader.readAsDataURL(attachment);

        return previewPopover(fileContent);
    } else if (previewFileTypes.csv) {
        const reader = new FileReader();
        const fileContent = h('table.table.table-hover', {
            style: previewFileStyle,
        }, logCreationModel.getAttachmentPreview(attachment.name));
    
        reader.onload = () => {
            let content;
    
            const lines = reader.result.split('\n');
            if (lines.length < 2) {
                content = h('div', 'Invalid CSV format');
            } else {
                const headers = lines[0].split(',');
                const headerRow = h('tr', headers.map((header, index) => h('th', {
                    key: index,
                }, header)));
    
                const tableRows = lines.slice(1).map((line, rowIndex) => {
                    const columns = line.split(',');
                    return h('tr', { key: rowIndex }, columns.map((column, colIndex) => h('td', { key: colIndex }, column)));
                });
    
                content = [
                    h('thead', { key: 'thead' }, headerRow),
                    h('tbody', { key: 'tbody' }, tableRows),
                ];
            }
    
            logCreationModel.setAttachmentPreview(content, attachment.name);
        };
        reader.readAsText(attachment);
    
        return previewPopover(fileContent);
    } else if (previewFileTypes.json || previewFileTypes.text || previewFileTypes.shellscript) {

        const reader = new FileReader();
        const fileContent = h('pre', {
            style: previewFileStyle,
        }, logCreationModel.getAttachmentPreview(attachment.name));

        reader.onload = () => {
            let content;

            if (previewFileTypes.json) {
                const jsonContent = JSON.parse(reader.result);
                content = JSON.stringify(jsonContent, null, 2);
            } else if (previewFileTypes.text || previewFileTypes.shellscript) {
                content = reader.result;
            }

            logCreationModel.setAttachmentPreview(content, attachment.name);
        };
        reader.readAsText(attachment);

        return previewPopover(fileContent);
    } else {
        return fileButton();
    }
};

/**
 * Builds a panel containing the label and tag picker for tags
 * @param {LogCreationModel} logCreationModel - Log creation model
 * @returns {vnode} - panel allowing users to select tags
 */
const tagsPanel = (logCreationModel) => {
    const tagsCount = logCreationModel.tagsPickerModel.selected.length;

    return labeledInput(
        { for: 'title' },
        `Tags (${tagsCount} selected)`,
        h(
            '.flex-column.scroll-y.p2',
            tagPicker(
                logCreationModel.tagsPickerModel,
                {
                    limit: null,
                    attributes: { class: 'grid columns-2-lg columns-3-xl' },
                    outlineSelection: true,
                },
            ),
        ),
        { class: 'flex-control-overflow flex-column' },
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
