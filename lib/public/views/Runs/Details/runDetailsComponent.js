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
import { lhcFillPanel } from './lhcFillPanel.js';
import { editTagsPanel } from './editTagsPanel.js';
import { tabbedPanelComponent } from '../../../components/TabbedPanel/tabbedPanelComponent.js';
import { RUN_DETAILS_PANELS_KEYS } from './RunDetailsModel.js';
import { table } from '../../../components/common/table/table.js';
import { logsActiveColumns } from '../../Logs/ActiveColumns/logsActiveColumns.js';
import { flpsActiveColumns } from '../../Flps/ActiveColumns/flpsActiveColumns.js';
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { collapsibleTreeNode } from '../../../components/common/tree/collapsibleTreeNode.js';
import { detailsList } from '../../../components/Detail/detailsList.js';
import { runDetailsConfiguration } from './runDetailsConfiguration.js';

/**
 * Returns a component displaying details for a given run
 *
 * @param {RunDetailsModel} runDetailsModel the run details model
 * @param {{go: function}} router the query router
 * @return {Component} the run display
 */
export const runDetailsComponent = (runDetailsModel, router) => runDetailsModel.runDetails.match({
    NotAsked: () => null,
    Loading: () => spinner(),
    Failure: (errors) => h('', [
        errors.map(errorAlert),
        h('button.btn.btn-primary.btn-redirect.mv2', {
            onclick: () => router.go('?page=run-overview'),
        }, 'Return to Overview'),
    ]),
    Success: (run) => [
        h('.flex-column.w-100', [
            h('.w-100.flex-row', [
                h('h2.w-40', `Run #${run.runNumber}`),
                h('.w-60.flex-row.items-center', {
                    style: 'justify-content: flex-end;',
                }, h('.btn-group.', [
                    !runDetailsModel.isEditModeEnabled ?
                        [
                            h('button.btn.btn-primary#create', {
                                onclick: () => router.go(`/?page=log-create&id=${run.runNumber}`),
                            }, 'Add Logs to this Run'),
                            h('button.btn#edit-run', {
                                onclick: () => {
                                    runDetailsModel.isEditModeEnabled = true;
                                },
                            }, 'Edit Run'),
                        ]
                        : [
                            h('button.btn.btn-success#save-run', {
                                onclick: () => {
                                    runDetailsModel.updateOneRun();
                                    runDetailsModel.clearAllEditors();
                                },
                            }, 'Save'),
                            h('button.btn#cancel-run', {
                                onclick: () => {
                                    runDetailsModel.clearAllEditors();
                                },
                            }, 'Revert'),
                        ],
                ])),
            ]),
            h('.flex-row.w-100', [
                h(
                    '.w-40.ph1',
                    detailsList(runDetailsConfiguration(runDetailsModel), run, { selector: 'Run' }),
                ),
                h('.w-30.ph3', lhcFillPanel(runDetailsModel.runDetails)),
                runDetailsModel.isEditModeEnabled && editTagsPanel(runDetailsModel),
            ]),
        ]),
        h('', tabbedPanelComponent(
            runDetailsModel.tabbedPanelModel,
            {
                [RUN_DETAILS_PANELS_KEYS.LOGS]: 'Log entries',
                [RUN_DETAILS_PANELS_KEYS.FLPS]: 'FLP statistics',
                [RUN_DETAILS_PANELS_KEYS.DPL_PROCESSES]: 'QC/PDP tasks',
            },
            {
                [RUN_DETAILS_PANELS_KEYS.LOGS]: (dataLogs) => table(dataLogs, logsActiveColumns, null, { profile: 'embeded' }),
                [RUN_DETAILS_PANELS_KEYS.FLPS]: (dataFlps) => table(dataFlps, flpsActiveColumns, {
                    callback: (entry) => ({
                        style: {
                            cursor: 'pointer',
                        },
                        onclick: () => router.go(`?page=flp-detail&id=${entry.id}`),
                    }),
                }),
                [RUN_DETAILS_PANELS_KEYS.DPL_PROCESSES]: (dplDetectorsRemoteData) => dplDetectorsRemoteData.match({
                    NotAsked: () => null,
                    Loading: () => spinner({ size: 5, absolute: false }),

                    /**
                     * Display a dpl detector table
                     *
                     * @param {DplDetectorTreeNodeModel[]} dplDetectorNodes the detectors nodes to display
                     * @return {vnode} the table
                     */
                    Success: (dplDetectorNodes) => h('.flex-column.g3', dplDetectorNodes.map((dplDetectorNode) => collapsibleTreeNode(
                        dplDetectorNode,
                        (dplDetector) => dplDetector.name,
                        (dplProcessNode) => collapsibleTreeNode(
                            dplProcessNode,
                            (dplProcess) => dplProcess.name,
                            (hostNode) => collapsibleTreeNode(
                                hostNode,
                                (host) => host.hostname,
                                ({ args }) => args ? h('code', args) : h('em', 'No args'),
                            ),
                        ),
                    ))),
                    Failure: (errors) => errors.map(errorAlert),
                }),
            },
        )),
    ],
});
