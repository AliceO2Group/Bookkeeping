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
import tagDetail from '../../../components/TagDetail/index.js';

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
                    h('h2.mv2.w-40', {
                        onremove: () => {
                            model.tags.isEditModeEnabled = false;
                            model.tags.tagChanges = {};
                            model.tags.clearTag();
                        },
                    }, `Tag: ${data.payload.text}`),
                    h('.w-60.flex-row.items-center', {
                        style: 'justify-content: flex-end;',
                    }, model.isAdmin() && h('.btn-group', [
                        model.tags.isEditModeEnabled ?
                            [
                                h('.button.btn.btn-success#save-run', {
                                    onclick: () => {
                                        model.tags.updateOneTag(data.payload.id);
                                        model.tags.isEditModeEnabled = false;
                                        model.tags.tagChanges = {};
                                    },
                                }, 'Save'),
                                h('.button.btn', {
                                    onclick: () => {
                                        model.tags.isEditModeEnabled = false;
                                        model.tags.tagChanges = {};
                                    },
                                }, 'Cancel'),
                            ]
                            : [
                                h('.button.btn.btn-primary', {
                                    onclick: () => {
                                        model.tags.tagChanges = {
                                            key: 'mattermost',
                                            value: data.payload.mattermost,
                                        };
                                        model.tags.tagChanges = {
                                            key: 'email',
                                            value: data.payload.email,
                                        };
                                        model.tags.isEditModeEnabled = true;
                                    },
                                }, 'Edit Tag'),
                            ],
                    ])),
                ]),
            ]),
            h('.flex-row.w-100', [h('.w-40.ph1', tagDetail(model, data.payload))]),
            h('.w-100', [
                h('ul.nav.nav-tabs', Object.entries(panels).map(([id, { name }]) =>
                    h('li.nav-item', h(`a.nav-link${activePanel === id ? '.active' : ''}`, {
                        onclick: (e) => activePanel !== id && model.router.handleLinkEvent(e),
                        href: targetURL(model, 'panel', id),
                        id: `${id}-tab`,
                    }, name)))),
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
