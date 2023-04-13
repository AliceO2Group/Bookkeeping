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

import { detailsList } from '../Detail/detailsList.js';
import { h } from '/js/src/index.js';
import { formatTimestamp } from '../../utilities/formatting/formatTimestamp.js';
import { formatEmail } from '../../utilities/formatting/formatEmail.js';

/**
 * The method to correctly format the current values given from the backend
 *
 * @param {TagDetailsModel} detailsModel the tag details model
 * @return {Object} A collection of field data
 */
const activeFields = (detailsModel) => ({
    id: {
        name: 'ID',
        visible: true,
        primary: true,
    },
    text: {
        name: 'name',
        visisble: true,
        size: 'cell-l',
    },
    description: {
        name: 'Description',
        visible: true,
        size: 'cell-l',
        format: (description) => detailsModel.isEditModeEnabled
            ? h('textarea.v-resize.form-control.w-60', {
                placeholder: 'Enter the description...',
                value: detailsModel.tagChanges['description'],
                maxlength: 100,
                oninput: (e) => detailsModel.setTagChange('description', e.target.value),
            })
            : description || '-',
    },
    mattermost: {
        name: 'Mattermost',
        visible: true,
        size: 'cell-l',
        format: (mattermost) => detailsModel.isEditModeEnabled
            ? h('input.form-control.w-60', {
                placeholder: 'Enter the mattermost channels... ("," separation)',
                value: detailsModel.tagChanges['mattermost'],
                oninput: (e) => detailsModel.setTagChange('mattermost', e.target.value),
            })
            : mattermost || '-',
    },
    email: {
        name: 'Email',
        visible: true,
        size: 'cell-l',
        format: (emails) => detailsModel.isEditModeEnabled
            ? h('input.form-control.w-60', {
                placeholder: 'Enter email groups... ("," separation)',
                value: detailsModel.tagChanges['email'],
                oninput: (e) => detailsModel.setTagChange('email', e.target.value),
            })
            : formatTagEmails(emails),
    },
    updatedAt: {
        name: 'Last modified',
        visible: true,
        size: 'cell-m',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    lastEditedName: {
        name: 'Last modified by',
        visible: true,
        size: 'cell-m',
        format: (name) => name ? name : '-',
    },
    archived: {
        name: 'Archived',
        visible: true,
        size: 'cell-l',
        format: (_, tag) => detailsModel.isEditModeEnabled
            ? h(
                'label.flex-row.g1.items-center',
                [
                    'No',
                    h('.switch#tag-archive-toggle', [
                        h(
                            'input',
                            {
                                checked: Boolean(detailsModel.tagChanges['archivedAt']),
                                onchange: (e) => {
                                    const archivedAt = e.target.checked ? tag.archivedAt ?? Date.now() : null;
                                    detailsModel.setTagChange('archivedAt', archivedAt);
                                },
                                type: 'checkbox',
                            },
                        ),
                        h('span.slider.round'),
                    ]),
                    'Yes',
                ],
            )
            : tag.archived ? 'Yes' : 'No',
    },
});

/**
 * A detail page with provides information about a tag.
 *
 * @param {TagDetailsModel} tagDetailsModel Pass the model to access the defined functions.
 * @param {object} tag all data related to the tag
 * @return {vnode} Returns a tag
 */
export const tagDetail = (tagDetailsModel, tag) => detailsList(
    activeFields(tagDetailsModel),
    tag,
    { selector: 'tag', attributes: { class: 'flex-column g2' } },
);

/**
 * Format a given emails list (comma separated values)
 *
 * @param {string} emails the comma separated list of tags
 * @return {Component} the emails display
 */
const formatTagEmails = (emails) => emails
    ? h(
        '.flex-row.justify-end.flex-wrap.gc3.gr1',
        emails.split(',').map(formatEmail),
    )
    : '-';
