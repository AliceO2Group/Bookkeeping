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
import table from '../../../components/Table/index.js';
import targetURL from '../../../utilities/targetURL.js';
import activeColumns from '../../Runs/ActiveColumnsLogs/index.js';
import activeColumnsFLP from '../../Flps/ActiveColumns/index.js';
import runDetail from '../../../components/RunDetail/index.js';
import editTagsPanel from './editTagsPanel.js';

/**
 * A collection of fields to show per Run detail, optionally with special formatting
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @return {Object} A key-value collection of all relevant fields
 */
const runDetails = (model) => {
    if (!model.router.params.id) {
        model.router.go('?page=run-overview');
        return;
    }

    if (!model.router.params.panel) {
        model.router.go(targetURL(model, 'panel', 'logs'), true);
        return;
    }

    const data = model.runs.getRun();
    const dataLogs = model.runs.getLogsOfRun();
    const dataFlps = model.runs.getFlpsOfRun();

    if (data.isSuccess()) {
        const activePanel = model.router.params.panel;

        const panels = {
            logs: {
                name: 'Log Entries',
                content: dataLogs.match({
                    NotAsked: () => { },
                    Loading: () => spinner({ absolute: false }),
                    Success: (payload) => table(payload, activeColumns(model), model, (entry) => ({
                        style: {
                            cursor: 'pointer',
                        },
                        onclick: () => model.router.go(`?page=log-detail&id=${entry.id}`),
                    })),
                    Failure: (payload) => payload.map((error) => h('.alert.alert-danger', error.title)),
                }),
            },
            flps: {
                name: 'FLP Statistics',
                content: dataFlps.match({
                    NotAsked: () => { },
                    Loading: () => spinner({ absolute: false }),
                    Success: (payload) => table(payload, activeColumnsFLP(model), model, (entry) => ({
                        style: {
                            cursor: 'pointer',
                        },
                        onclick: () => model.router.go(`?page=flp-detail&id=${entry.id}`),
                    })),
                    Failure: (payload) => payload.map((error) => h('.alert.alert-danger', error.title)),
                }),
            },
        };

        return [
            h('.flex-column.w-100', [
                h('.w-100.flex-row', [
                    h('h2.w-40', `Run #${data.payload.runNumber}`),
                    h('.w-60.flex-row.items-center', {
                        style: 'justify-content: flex-end;',
                    }, h('.btn-group.', [
                        !model.runs.isEditModeEnabled ?
                            [
                                h('button.btn.btn-primary#create', {
                                    onclick: () => model.router.go(`/?page=log-create&id=${data.payload.runNumber}`),
                                }, 'Add Logs to this Run'),
                                h('button.btn#edit-run', {
                                    onclick: () => {
                                        model.runs.isEditModeEnabled = true;
                                    },
                                }, 'Edit Run'),
                            ]
                            : [
                                h('button.btn.btn-success#save-run', {
                                    onclick: () => {
                                        model.runs.updateOneRun();
                                        model.runs.isEditModeEnabled = false;
                                        model.runs.runChanges = {};
                                    },
                                }, 'Save'),
                                h('button.btn#cancel-run', {
                                    onclick: () => {
                                        model.runs.isEditModeEnabled = false;
                                        model.runs.runChanges = {};
                                    },
                                }, 'Revert'),
                            ],
                    ])),
                ]),
                h('.flex-row.w-100', [
                    h('.w-40.ph1', runDetail(model, data.payload)),
                    model.runs.isEditModeEnabled && editTagsPanel(model),
                ]),
            ]),
            h('.w-100', [
                h('ul.nav.nav-tabs', Object.entries(panels).map(([id, { name }]) =>
                    h('li.nav-item', h(`a.nav-link${activePanel === id ? '.active' : ''}`, {
                        onclick: (e) => {
                            activePanel !== id && model.router.handleLinkEvent(e);
                            model.runs.switchTab(id);
                        },
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
        return h('', [
            data.payload.map(errorAlert),
            h('button.btn.btn-primary.btn-redirect.mv2', {
                onclick: () => model.router.go('?page=run-overview'),
            }, 'Return to Overview'),
        ]);
    }
};

export default (model) => runDetails(model);
