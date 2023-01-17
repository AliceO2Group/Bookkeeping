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
import spinner from '../../../components/common/spinner.js';
import { table } from '../../../components/common/table/table.js';
import targetURL from '../../../utilities/targetURL.js';
import { reducedLogsActiveColumns } from '../../Logs/ActiveColumns/reducedLogsActiveColumns.js';
import { tagDetail } from '../../../components/tag/tagDetail.js';
import { tabLink } from '../../../components/common/navigation/tabLink.js';

/**
 * The VNode of the Tag Detail screen.
 *
 * @param {*} model Pass the model to access the defined functions.
 * @return {vnode} The VNode of the Tag Detail screen.
 */
const tagDetails = (model) => {
    if (!model.router.params.id) {
        model.router.go('?page=tag-overview');
        return;
    }

    if (!model.router.params.panel) {
        model.router.go(targetURL(model, 'panel', 'logs'), true);
        return;
    }

    const data = model.tags.getTag();
    const dataLogs = model.tags.getLogsOfTag();

    if (data.isSuccess()) {
        /** @type {Tag} */
        const tag = data.payload;
        const activePanel = model.router.params.panel;

        const panels = {
            logs: {
                name: 'Logs with this tag',
                content: table(dataLogs, reducedLogsActiveColumns, {
                    callback: (entry) => ({
                        style: {
                            cursor: 'pointer',
                        },
                        onclick: () => model.router.go(`?page=log-detail&id=${entry.id}`),
                    }),
                }),
            },
        };

        return [
            h('.flex-column.w-100', [
                h('.w-100.flex-row', [
                    h('.flex-row.items-center.gc3', [
                        h(
                            'h2.mv2.flex-row',
                            {
                                onremove: () => {
                                    model.tags.clearTagChanges();
                                    model.tags.clearTag();
                                },
                            },
                            `Tag: ${tag.text}`,
                        ),
                        tag.archived ? h('.f4.badge.bg-gray-darker.white', 'Archived') : null,
                    ]),
                    h('.flex-grow.flex-row.items-center', {
                        style: 'justify-content: flex-end;',
                    }, model.isAdmin() && h('.btn-group', [
                        model.tags.isEditModeEnabled ?
                            [
                                h('.button.btn.btn-success#confirm-tag-edit', {
                                    onclick: () => {
                                        model.tags.updateOneTag(tag.id);
                                    },
                                }, 'Save'),
                                h('.button.btn#cancel-tag-edit', {
                                    onclick: () => {
                                        model.tags.clearTagChanges();
                                    },
                                }, 'Cancel'),
                            ]
                            : [
                                h('#edit-tag.button.btn.btn-primary', {
                                    onclick: () => {
                                        model.tags.setTagChange('mattermost', tag.mattermost);
                                        model.tags.setTagChange('email', tag.email);
                                        model.tags.setTagChange('archivedAt', tag.archivedAt);
                                        model.tags.isEditModeEnabled = true;
                                    },
                                }, 'Edit Tag'),
                            ],
                    ])),
                ]),
            ]),
            h('.flex-row.w-100', [h('.w-40.ph1', tagDetail(model, tag))]),
            h('.w-100', [
                h('ul.nav.nav-tabs', Object.entries(panels).map(([id, { name }]) =>
                    h('li.nav-item', tabLink(name, { panel: id }, { id: `${id}-tab` })))),
                h('.tab-content.p2', Object.entries(panels).map(([id, { content }]) =>
                    h(`.tab-pane${activePanel === id ? '.active' : ''}`, { id: `${id}-pane` }, content))),
            ]),
        ];
    } else if (data.isLoading()) {
        return spinner();
    } else if (data.isFailure()) {
        return data.payload.map(errorAlert);
    }
};

export default (model) => tagDetails(model);
