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

import { table } from '../../../components/common/table/table.js';
import { logsActiveColumns } from '../../Logs/ActiveColumns/logsActiveColumns.js';
import { flpsActiveColumns } from '../../Flps/ActiveColumns/flpsActiveColumns.js';
import { h } from '/js/src/index.js';
import { detailsList } from '../../../components/Detail/detailsList.js';
import { runDetailsConfiguration } from './runDetailsConfiguration.js';
import lhcFillPanel from './lhcFillPanel.js';
import { editTagsPanel } from './editTagsPanel.js';
import { tabLink } from '../../../components/common/navigation/tabLink.js';
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';

/**
 * Returns a component displaying details for a given run
 *
 * @param {Model} model the run details model
 * @return {Component} the run display
 */
export const runDetailsComponent = (model) => {
    const data = model.runs.detailsModel.run;
    const dataLogs = model.runs.detailsModel.getLogsOfRun();
    const dataFlps = model.runs.detailsModel.getFlpsOfRun();
    if (data.isSuccess()) {
        const activePanel = model.router.params.panel;
        const panels = {
            logs: {
                name: 'Log Entries',
                content: table(dataLogs, logsActiveColumns, null, { profile: 'embeded' }),
            },
            flps: {
                name: 'FLP Statistics',
                content: table(dataFlps, flpsActiveColumns, {
                    callback: (entry) => ({
                        style: {
                            cursor: 'pointer',
                        },
                        onclick: () => model.router.go(`?page=flp-detail&id=${entry.id}`),
                    }),
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
                        !model.runs.detailsModel.isEditModeEnabled ?
                            [
                                h('button.btn.btn-primary#create', {
                                    onclick: () => model.router.go(`/?page=log-create&id=${data.payload.runNumber}`),
                                }, 'Add Logs to this Run'),
                                h('button.btn#edit-run', {
                                    onclick: () => {
                                        model.runs.detailsModel.isEditModeEnabled = true;
                                    },
                                }, 'Edit Run'),
                            ]
                            : [
                                h('button.btn.btn-success#save-run', {
                                    onclick: () => {
                                        model.runs.detailsModel.updateOneRun();
                                        model.runs.detailsModel.clearAllEditors();
                                    },
                                }, 'Save'),
                                h('button.btn#cancel-run', {
                                    onclick: () => {
                                        model.runs.detailsModel.clearAllEditors();
                                    },
                                }, 'Revert'),
                            ],
                    ])),
                ]),
                h('.flex-row.w-100', [
                    h(
                        '.w-40.ph1',
                        detailsList(runDetailsConfiguration(model.runs.detailsModel), data.payload, { selector: 'Run' }),
                    ),
                    h('.w-30.ph3', lhcFillPanel(model.runs.detailsModel)),
                    model.runs.detailsModel.isEditModeEnabled && editTagsPanel(model.runs.detailsModel),
                ]),
            ]),
            h('.w-100', [
                h('ul.nav.nav-tabs', Object.entries(panels).map(([id, { name }]) =>
                    h('li.nav-item', tabLink(
                        name,
                        { panel: id },
                        {
                            id: `${id}-tab`,
                            onclick: () => model.runs.switchTab(id),
                        },
                    )))),
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

    return null;
};