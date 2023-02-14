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
 * @param {Model} model the overall model function
 * @return {Object} A collection of field data
 */
const activeFields = (model) => ({
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
    mattermost: {
        name: 'Mattermost',
        visible: true,
        size: 'cell-l',
        format: (mattermost) => model.tags.isEditModeEnabled
            ? h('input.form-control.w-60', {
                placeholder: 'Enter the mattermost channels... ("," separation)',
                value: model.tags.tagChanges['mattermost'],
                oninput: (e) => {
                    model.tags.setTagChange('mattermost', e.target.value);
                },
            })
            : mattermost || '-',
    },
    email: {
        name: 'Email',
        visible: true,
        size: 'cell-l',
        format: (emails) => model.tags.isEditModeEnabled
            ? h('input.form-control.w-60', {
                placeholder: 'Enter email groups... ("," separation)',
                value: model.tags.tagChanges['email'],
                oninput: (e) => {
                    model.tags.setTagChange('email', e.target.value);
                },
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
        format: (_, tag) => model.tags.isEditModeEnabled
            ? h(
                'label.flex-row.g1.items-center',
                [
                    'No',
                    h('.switch#tag-archive-toggle', [
                        h(
                            'input',
                            {
                                checked: Boolean(model.tags.tagChanges['archivedAt']),
                                onchange: (e) => {
                                    const archivedAt = e.target.checked ? tag.archivedAt ?? Date.now() : null;
                                    model.tags.setTagChange('archivedAt', archivedAt);
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
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @return {vnode} Returns a post
 */
export const tagDetail = (model, post) => {
    const postFields = activeFields(model);
    return detailsList(postFields, post, 'tag');
};

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
