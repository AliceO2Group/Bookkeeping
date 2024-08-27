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

import { h, iconChevronRight } from '/js/src/index.js';
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
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { qcGuiLinkComponent } from '../../../components/common/externalLinks/qcGuiLinkComponent.js';
import { aliEcsEnvironmentLinkComponent } from '../../../components/common/externalLinks/aliEcsEnvironmentLinkComponent.js';
import { isRunConsideredRunning } from '../../../services/run/isRunConsideredRunning.js';
import { epnInfologgerLinkComponent, flpInfologgerLinkComponent } from '../../../components/common/externalLinks/infologgerLinksComponents.js';
import { formatItemsCount } from '../../../utilities/formatting/formatItemsCount.js';
import { formatRunDetectors } from '../format/formatRunDetectors.js';
import { PanelComponent } from '../../../components/common/panel/PanelComponent.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { displayRunDuration } from '../format/displayRunDuration.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { formatRunQuality } from '../format/formatRunQuality.js';
import { formatTagsList } from '../../Tags/format/formatTagsList.js';
import { formatRunType } from '../../../utilities/formatting/formatRunType.js';
import { formatBoolean } from '../../../utilities/formatting/formatBoolean.js';
import { formatFileSize } from '../../../utilities/formatting/formatFileSize.js';

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
    Success: (run) => {
        if (!router.params.runNumber) {
            const targetPanel = router.params.panel ?? runDetailsModel.tabbedPanelModel.currentPanelKey ?? 'logs';
            router.go(`?page=run-detail&runNumber=${runDetailsModel._runNumber}&panel=${targetPanel}`);
        }

        const { environmentId, runNumber } = run;

        const flpInfologgerLink = flpInfologgerLinkComponent({ environmentId, runNumbers: runNumber });
        const epnInfologgerLink = epnInfologgerLinkComponent({ environmentId, runNumbers: runNumber });
        const aliEcsEnvironmentLink = aliEcsEnvironmentLinkComponent(environmentId);

        // QueryParameters with runNumber as default, and environmentId or lhcFillNumber if available
        const queryParameters = {
            runNumbers: [run.runNumber],
            ...run.environmentId ? { environmentIds: [run.environmentId] } : {},
            ...run.fillNumber ? { lhcFillNumbers: [run.fillNumber] } : {},
        };

        const environmentLink = run.environmentId
            ? frontLink(run.environmentId, 'env-details', { environmentId: run.environmentId })
            : null;

        return [
            h('.flex-column.w-100', [
                h('.w-100.flex-row.justify-between', [
                    h(
                        '.flex-row.items-center.g3',
                        [
                            h('h2', `Run #${run.runNumber}`),
                            h('.f4', formatTagsList(run.tags, { flex: true, description: true, placeholder: null })),
                        ],
                    ),
                    h(
                        '.flex-row.items-center',
                        { style: 'justify-content: flex-end;' },
                        h('.btn-group.', [
                            !runDetailsModel.isEditModeEnabled ?
                                [
                                    frontLink(
                                        'Add log to this run',
                                        'log-create',
                                        queryParameters,
                                        { id: 'create-log', class: 'btn btn-primary' },
                                    ),
                                    h('button.btn#edit-run', {
                                        onclick: () => {
                                            runDetailsModel.isEditModeEnabled = true;
                                        },
                                    }, 'Edit Run'),
                                ]
                                : [
                                    h('button.btn.btn-success#save-run', {
                                        disabled: !runDetailsModel.isEditionPatchValid,
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
                        ]),
                    ),
                ]),
                h('h3.external-links.flex-row.w-100.g2.items-baseline.mb3', [
                    environmentLink && [h('', 'Environment: '), environmentLink],
                    (flpInfologgerLink || epnInfologgerLink) && [h('', 'Infologger: '), flpInfologgerLink, epnInfologgerLink],
                    [qcGuiLinkComponent(run)],
                    isRunConsideredRunning(run) && aliEcsEnvironmentLink && [aliEcsEnvironmentLink],
                ].filter((elements) => elements).flatMap((elements) => ['-', ...elements]).slice(1)),
                errorAlert(runDetailsModel.updateErrors),
                h('.flex-column.g2', [
                    h(PanelComponent, [
                        h('.panel-header', 'Timeline'),
                        h('.flex-row.flex-wrap.p2.items-center.g3', [
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'O2 Start'),
                                formatTimestamp(run.timeO2Start),
                            ]),
                            iconChevronRight(),
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'Trigger Start'),
                                formatTimestamp(run.timeTrgStart),
                            ]),
                            iconChevronRight(),
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'Data Transfer Start'),
                                formatTimestamp(run.startOfDataTransfer),
                            ]),
                            iconChevronRight(),
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'Trigger End'),
                                formatTimestamp(run.timeTrgEnd),
                            ]),
                            iconChevronRight(),
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'O2 End'),
                                formatTimestamp(run.timeO2End),
                            ]),
                            iconChevronRight(),
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'Data Transfer End'),
                                formatTimestamp(run.endOfDataTransfer),
                            ]),
                            h('strong', '|'),
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'Run duration'),
                                h('#runDurationValue', displayRunDuration(run)),
                            ]),
                        ]),
                    ]),
                    h(PanelComponent, [
                        h('.panel-header', h('.flex-row.g2', [
                            'Detectors',
                            h('.badge.bg-white', run.nDetectors),
                            h('', '-'),
                            h('strong', 'Global quality: '),
                            formatRunQuality(runDetailsModel, run.runQuality, run),
                        ])),
                        h('.p2', formatRunDetectors(run, runDetailsModel)),
                    ]),
                    h('.flex-row.items-start.g2', [
                        h(PanelComponent, { class: 'flex-grow' }, [
                            h('.panel-header', 'Components'),
                            h('.flex-row.p2.items-center.g3', [
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', '# EPNs'),
                                    run.nEpns,
                                ]),
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', '# FLPs'),
                                    run.nFlps,
                                ]),
                                h('strong', '|'),
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', 'Trigger'),
                                    run.triggerValue,
                                ]),
                                h('strong', '|'),
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', 'DD FLP'),
                                    formatBoolean(run.dd_flp),
                                ]),
                                h('strong', '|'),
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', 'DCS'),
                                    formatBoolean(run.dcs),
                                ]),
                            ]),
                        ]),
                        h(PanelComponent, { class: 'flex-grow' }, [
                            h('.panel-header', 'ALICE Magnets'),
                            h('.flex-row.p2.items-center.g3', [
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', 'Dipole Current'),
                                    run.aliceDipoleCurrent,
                                ]),
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', 'Dipole Polarity'),
                                    run.aliceDipolePolarity,
                                ]),
                                h('strong', '|'),
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', 'L3 Current'),
                                    run.aliceL3Current,
                                ]),
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', 'L3 Polarity'),
                                    run.aliceL3Polarity,
                                ]),
                            ]),
                        ]),
                    ]),
                    h(PanelComponent, [
                        h('.panel-header', 'Metrics'),
                        h('.flex-row.p2.items-center.g3', [
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'CTF Files count'),
                                formatItemsCount(run.ctfFileCount),
                            ]),
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'CTF Files size'),
                                formatFileSize(run.ctfFileSize),
                            ]),
                            h('strong', '|'),
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'TF Files count'),
                                formatItemsCount(run.tfFileCount),
                            ]),
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'TF Files size'),
                                formatFileSize(run.tfFileSize),
                            ]),
                            h('strong', '|'),
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'Other Files count'),
                                formatItemsCount(run.otherFileCount),
                            ]),
                        ]),
                    ]),
                    h('.flex-row.items-start.g2', [
                        h(PanelComponent, { class: 'flex-grow' }, [
                            h('.panel-header', h('.flex-row.items-center.justify-between', 'Configuration')),
                            h('.flex-column.p2.g2', [
                                h('.flex-row', [
                                    h('.flex-column.items-center.flex-grow', [
                                        h('strong', 'Run Definition'),
                                        run.definition || '-',
                                    ]),
                                    h('.flex-column.items-center.flex-grow', [
                                        h('strong', 'Run Type'),
                                        formatRunType(run.runType),
                                    ]),
                                ]),
                            ]),
                            h('.flex-column.p2.g2', [
                                h('', [
                                    h('strong', 'PDP Configuration Option: '),
                                    run.pdpConfigOption || '-',
                                ]),
                                h('', [
                                    h('strong', 'PDP Topology Description Library File: '),
                                    run.pdpTopologyDescriptionLibraryFile || '-',
                                ]),
                                h('', [
                                    h('strong', 'PDP Workflow Parameters: '),
                                    run.pdpWorkflowParameters || '-',
                                ]),
                                h('', [
                                    h('strong', 'PDP Beam Type: '),
                                    run.pdpBeamType || '-',
                                ]),
                                h('', [
                                    h('strong', 'TFB DD Mode: '),
                                    run.tfbDdMode || '-',
                                ]),
                                h('', [
                                    h('strong', 'Topology: '),
                                    run.epnTopology || '-',
                                ]),
                                h('', [
                                    h('strong', 'Topology full name: '),
                                    run.odcTopologyFullName || '-',
                                ]),
                                h('', [
                                    h('strong', 'Readout config URI: '),
                                    run.readoutCfgUri || '-',
                                ]),
                            ]),
                        ]),
                        h(PanelComponent, { class: 'flex-grow' }, [
                            h('.panel-header', h('.flex-row.items-center.justify-between', [
                                'LHC',
                                h(
                                    'span',
                                    ['Fill ', frontLink(run.lhcFill?.fillNumber, 'lhc-fill-details', { fillNumber: run.lhcFill?.fillNumber })],
                                ),
                                frontLink(
                                    'Details',
                                    'lhc-fill-details',
                                    { fillNumber: run.lhcFill?.fillNumber },
                                    { id: 'create-log', class: 'btn btn-primary btn-sm' },
                                ),
                            ])),
                            h('.flex-row.p2.items-center.g3', [
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', 'SB Start'),
                                    formatTimestamp(run.lhcFill?.stableBeamsStart),
                                ]),
                                iconChevronRight(),
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', 'SB End'),
                                    formatTimestamp(run.lhcFill?.stableBeamsEnd),
                                ]),
                                h('strong', '|'),
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', 'Beams duration'),
                                    h('#runDurationValue', formatDuration(1000 * run.lhcFill?.stableBeamsDuration)),
                                ]),
                            ]),
                            h('.flex-column.p2.g2', [
                                h('.flex-row', [
                                    h('.flex-grow', [
                                        h('strong', 'Beams type: '),
                                        run.lhcFill?.beamType,
                                    ]),
                                    h('.flex-grow', [
                                        h('strong', 'Beam mode: '),
                                        run.lhcBeamMode,
                                    ]),
                                ]),
                                h('', [
                                    h('strong', 'Beam Energy: '),
                                    run.lhcBeamEnergy ? `${run.lhcBeamEnergy} GeV` : '-',
                                ]),
                                h('', [
                                    h('strong', 'Filling scheme: '),
                                    run.lhcFill?.fillingSchemeName,
                                ]),
                                h('', [
                                    h('strong', 'Beta Star: '),
                                    run.lhcBetaStar ?? '-',
                                ]),
                                h('', [
                                    h('strong', 'LHC Period: '),
                                    run.lhcPeriod ?? '-',
                                ]),
                            ]),
                        ]),
                    ]),
                ]),
                h('.flex-row.g3', [
                    h(
                        '.flex-grow',
                        detailsList(runDetailsConfiguration(runDetailsModel), run, { selector: 'Run' }),
                    ),
                ]),
            ]),
            h('', tabbedPanelComponent(
                runDetailsModel.tabbedPanelModel,
                {
                    [RUN_DETAILS_PANELS_KEYS.LOGS]: 'Log entries',
                    [RUN_DETAILS_PANELS_KEYS.FLPS]: 'FLP statistics',
                    [RUN_DETAILS_PANELS_KEYS.DPL_PROCESSES]: 'QC/PDP tasks',
                    [RUN_DETAILS_PANELS_KEYS.TRIGGER_COUNTERS]: 'Trigger counters',
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
                        Success: (dplDetectorNodes) => {
                            if (dplDetectorNodes.length === 0) {
                                return h('p', 'NO DETECTOR');
                            }
                            return h('.flex-column.g3', dplDetectorNodes.map((dplDetectorNode) => collapsibleTreeNode(
                                dplDetectorNode,
                                (dplDetector) => dplDetector.name,
                                (dplProcessNode) => collapsibleTreeNode(
                                    dplProcessNode,
                                    (dplProcess) =>
                                        `${dplProcess.name}${dplProcess.type && dplProcess.type.label ? ` (${dplProcess.type.label})` : ''}`,
                                    (hostNode) => collapsibleTreeNode(
                                        hostNode,
                                        (host) => host.hostname,
                                        ({ args }) => args ? h('code', args) : h('em', 'No args'),
                                    ),
                                ),
                            )));
                        },
                        Failure: (errors) => errors.map(errorAlert),
                    }),
                    [RUN_DETAILS_PANELS_KEYS.TRIGGER_COUNTERS]: (triggerCounters) => table(
                        triggerCounters,
                        {
                            className: {
                                visible: true,
                                name: 'Class name',
                            },
                            lmb: {
                                visible: true,
                                name: 'LMB',
                                classes: 'text-right',
                                format: formatItemsCount,
                            },
                            lma: {
                                visible: true,
                                name: 'LMA',
                                format: formatItemsCount,
                            },
                            l0b: {
                                visible: true,
                                name: 'L0B',
                                format: formatItemsCount,
                            },
                            l0a: {
                                visible: true,
                                name: 'L0A',
                                format: formatItemsCount,
                            },
                            l1b: {
                                visible: true,
                                name: 'L1B',
                                format: formatItemsCount,
                            },
                            l1a: {
                                visible: true,
                                name: 'L1A',
                                format: formatItemsCount,
                            },
                        },
                        { classes: 'table-sm' },
                    ),
                },
            )),
        ];
    },
});
