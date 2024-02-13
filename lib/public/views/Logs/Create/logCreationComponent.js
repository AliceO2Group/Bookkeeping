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
import { filePreviewPopoverLink } from '../FilePreview/attachmentPreviewComponent.js';
import { popover } from '../../../components/common/popover/popover.js';
import { PopoverTriggerPreConfiguration } from '../../../components/common/popover/popoverPreConfigurations.js';
import { PopoverAnchors } from '../../../components/common/popover/PopoverEngine.js';
import { filePreviewComponent } from '../FilePreview/filePreviewComponent.js';
import { PanelComponent } from '../../../components/common/panel/PanelComponent.js';
import { LabelPanelHeaderComponent } from '../../../components/common/panel/LabelPanelHeaderComponent.js';
import { logCreationContentPanel } from './panels/LogCreationContentPanel.js';

/**
 * Returns the component containing the log creation form
 *
 * @param {LogCreationModel} creationModel the creation model
 * @param {object} configuration the configuration of form
 * @param {Component} [configuration.title="New log"] title of the form
 * @param {Component} [configuration.mainPane] main form pane, of the left side of the screen
 * @param {Component} [configuration.sidePane] side form pane, on the right side of the screen
 * @return {vnode} the form component
 */
export const logCreationForm = (creationModel, configuration) => {
    const {
        title = 'New log',
        mainPane = [
            titlePanel(creationModel),
            // eslint-disable-next-line no-return-assign
            logCreationContentPanel(creationModel.text, (newContent) => creationModel.text = newContent),
        ],
        sidePane = [
            runNumbersPanel(creationModel),
            environmentsPanel(creationModel),
            lhcFillsPanel(creationModel),
            attachmentsPanel(creationModel),
            tagsPanel(creationModel),
        ],
    } = configuration;

    return [
        h('.flex-row.mv2.justify-between', [
            h('.f3.flex-row.g2', title),
            postLogPanel(creationModel),
        ]),
        h('.flex-row.g3.flex-grow', [
            h('.w-60.flex-column.g3', mainPane),
            h('.w-40.flex-column.g3', sidePane),
        ]),
    ];
};

/**
 * Build a panel containing the title label and input field for user to provide a title
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - Title panel
 */
const titlePanel = (logCreationModel) => h(PanelComponent, [
    h(LabelPanelHeaderComponent, { for: 'title' }, 'Title'),
    h('input#title.form-control.panel-body.bg', {
        placeholder: 'Enter the title of the log entry...',
        minlength: 3,
        maxlength: 140,
        value: logCreationModel.title,
        oninput: (e) => {
            logCreationModel.title = e.target.value;
        },
    }),
]);

/**
 * Builds a panel containing the label and input field for run numbers
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - Panel allowing user to input run numbers
 */
const runNumbersPanel = (logCreationModel) => h(PanelComponent, [
    h(LabelPanelHeaderComponent, { for: 'run-numbers' }, 'Run numbers'),
    h('input#run-numbers.form-control', {
        placeholder: '1234, 5678, 91011, ... ',
        value: logCreationModel.runNumbers,
        oninput: (e) => {
            logCreationModel.runNumbers = e.target.value;
        },
        disabled: logCreationModel.isRunNumbersReadonly,
    }),
]);

/**
 * Builds a panel containing the label and input field for lhc fill numbers
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - Panel allowing user to input lhc fill numbers
 */
const lhcFillsPanel = (logCreationModel) => h(PanelComponent, [
    h(LabelPanelHeaderComponent, { for: 'lhc-fills' }, 'LHC Fills'),
    h('input#lhc-fills.form-control', {
        placeholder: '1234, 5678, 91011, ... ',
        value: logCreationModel.lhcFills,
        oninput: (e) => {
            logCreationModel.lhcFills = e.target.value;
        },
    }),
]);

/**
 * Builds a panel containing the label and input field for environment IDs
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - Panel allowing user to input environment IDs
 */
const environmentsPanel = (logCreationModel) => h(PanelComponent, [
    h(LabelPanelHeaderComponent, { for: 'environments' }, 'Environment IDs'),
    h('input#environments.form-control', {
        placeholder: 'e.g. Dxi029djX, TDI59So3d...',
        value: logCreationModel.environments,
        oninput: (e) => {
            logCreationModel.environments = e.target.value;
        },
    }),
]);

/**
 * Builds a panel containing the label, display list of attached files, a file upload button
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @return {vnode} - panel allowing the user to attach files
 */
const attachmentsPanel = (logCreationModel) => {
    const { attachments: attachmentsFileList } = logCreationModel;

    /**
     * @type {File[]}
     */
    const attachments = [...attachmentsFileList];

    let fileText;
    switch (attachments.length) {
        case 0:
            fileText = 'No files chosen';
            break;
        case 1:
            fileText = `${attachments.length} file chosen`;
            break;
        default:
            fileText = `${attachments.length} files chosen`;
            break;
    }

    return h(PanelComponent, [
        h(LabelPanelHeaderComponent, { for: 'attachments' }, 'File attachments'),
        h('.flex-row.justify-between.items-center.p2', [
            h(
                'label.flex-row.g2.items-center',
                { for: 'attachments' },
                [
                    h('.btn', 'Choose files'),
                    h('', fileText),
                ],
            ),
            h('input#attachments.w-33.d-none', {
                type: 'file',
                multiple: true,
                onchange: (e) => {
                    logCreationModel.attachments = e.target.files;
                },
            }),
            attachments.length > 0 && h(
                'button#clearAttachments.btn.btn-danger.ml3',
                { onclick: () => logCreationModel.clearAttachments() },
                'Clear',
            ),
        ]),
        h('#attachments-list.flex-row.flex-wrap.p2', attachments.flatMap((attachment) => {
            const preview = filePreviewComponent(attachment, attachment.type, attachment.name);
            return [
                preview
                    ? popover(
                        filePreviewPopoverLink(attachment.name),
                        h(
                            '.p2.flex-row.items-center',
                            { key: window.btoa(`${attachment.name}-${attachment.size}-${attachment.lastModified}`) },
                            preview,
                        ),
                        {
                            ...PopoverTriggerPreConfiguration.click,
                            anchor: PopoverAnchors.TOP_MIDDLE,
                            setChildrenSize: true,
                        },
                    )
                    : h('', attachment.name),
                h('span.mr2', ','),
            ];
        }).slice(0, -1)),
    ]);
};

/**
 * Builds a panel containing the label and tag picker for tags
 * @param {LogCreationModel} logCreationModel - Log creation model
 * @returns {vnode} - panel allowing users to select tags
 */
const tagsPanel = (logCreationModel) => {
    const tagsCount = logCreationModel.tagsPickerModel.selected.length;

    return h(
        PanelComponent,
        { class: 'flex-control-overflow flex-column' },
        [
            h(LabelPanelHeaderComponent, { for: 'title' }, `Tags (${tagsCount} selected)`),
            h(
                '.flex-column.scroll-y.p2',
                tagPicker(
                    logCreationModel.tagsPickerModel,
                    {
                        limit: null,
                        attributes: { class: 'grid columns-2-lg columns-3-xl g2' },
                        outlineSelection: true,
                    },
                ),
            ),
        ],
    );
};

/**
 * Builds a panel containing a post log button
 *
 * @param {LogCreationModel} logCreationModel - Logs creation model
 * @returns {vnode} - panel containing the button allowing the user to create a log
 */
const postLogPanel = (logCreationModel) => {
    const disabled = !logCreationModel.isValid
        || logCreationModel.createdLog.isLoading();

    return h('button.btn.btn-success#send.w-20', {
        disabled,
        onclick: () => logCreationModel.submit(),
    }, logCreationModel.createdLog.isLoading() ? 'Creating...' : 'Post log');
};

/**
 * A function to construct the create log screen
 *
 * @param {LogCreationModel} creationModel - Log creation model
 * @return {Component} the log creation component
 */
export const logCreationComponent = (creationModel) => [
    creationModel.createdLog.match({
        Failure: (errors) => errors.map(errorAlert),
        Other: () => null,
    }),
    logCreationForm(creationModel, {}),
];
