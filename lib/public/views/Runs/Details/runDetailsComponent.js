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

import { h, iconChevronRight, iconExternalLink, info } from '/js/src/index.js';
import { tabbedPanelComponent } from '../../../components/TabbedPanel/tabbedPanelComponent.js';
import { RUN_DETAILS_PANELS_KEYS } from './RunDetailsModel.js';
import { table } from '../../../components/common/table/table.js';
import { logsActiveColumns } from '../../Logs/ActiveColumns/logsActiveColumns.js';
import { flpsActiveColumns } from '../../Flps/ActiveColumns/flpsActiveColumns.js';
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { collapsibleTreeNode } from '../../../components/common/tree/collapsibleTreeNode.js';
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
import { RunDefinition } from '../../../domain/enums/RunDefinition.js';
import { formatFloat } from '../../../utilities/formatting/formatFloat.js';
import { formatEditableNumber } from '../format/formatEditableNumber.js';
import { PdpBeamType } from '../../../domain/enums/PdpBeamType.js';
import { editRunEorReasons } from '../format/editRunEorReasons.js';
import { formatEorReason } from '../format/formatEorReason.mjs';
import { selectionDropdown } from '../../../components/common/selection/dropdown/selectionDropdown.js';
import { formatRunCalibrationStatus } from '../format/formatRunCalibrationStatus.js';
import { BeamModes } from '../../../domain/enums/BeamModes.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { runLuminosityValuesComponent } from './runLuminosityValuesComponent.js';

const GREEK_LOWER_MU_ENCODING = '\u03BC';

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

    /**
     * Run details display
     * @param {Run} run run to be displayed
     * @return {Component} the run details
     */
    Success: (run) => {
        const { environmentId, runNumber } = run;
        const { ctpTriggerCounters: remoteCtpTriggerCounters } = runDetailsModel;

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

        const luminosityPanel = run.lhcFill && remoteCtpTriggerCounters.match({
            NotAsked: () => h('em', 'Failed to load luminosity information'),
            Success: (ctpTriggerCounters) => runLuminosityValuesComponent(run, ctpTriggerCounters || []),
            Loading: () => spinner({ size: 2, absolute: false }),
            Failure: (error) => errorAlert(error),
        });

        return [
            h('.flex-column.w-100', [
                h('.w-100.flex-row.justify-between', [
                    h(
                        '.flex-row.items-center.g3',
                        [
                            h('h2', `Run #${run.runNumber}`),
                            h(
                                '#tags.f4',
                                runDetailsModel.isEditModeEnabled
                                    ? selectionDropdown(
                                        runDetailsModel.editionTagPickerModel,
                                        { selectorPrefix: 'tags', placeholder: 'No tags' },
                                    )
                                    : formatTagsList(run.tags, { flex: true, description: true, placeholder: null }),
                            ),
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
                h(
                    'h3.flex-row.w-100.g2.items-baseline.mb3',
                    [
                        environmentLink && [h('', 'Environment: '), environmentLink],
                        (flpInfologgerLink || epnInfologgerLink) && [h('', 'Infologger: '), flpInfologgerLink, epnInfologgerLink],
                        [qcGuiLinkComponent(run)],
                        isRunConsideredRunning(run) && aliEcsEnvironmentLink && [aliEcsEnvironmentLink],
                    ]
                        .filter((elements) => elements && elements.filter((item) => item).length)
                        .flatMap((elements) => ['-', ...elements])
                        .slice(1),
                ),
                errorAlert(runDetailsModel.updateErrors),
                h('.flex-column.g2', [
                    h(PanelComponent, [
                        h('.panel-header', 'Timeline'),
                        h('.flex-row.flex-wrap.p2.items-center.g3', [
                            h('.flex-column.items-center.flex-grow', [
                                h('strong.flex-row.items-center.g2', [
                                    'O2 Start',
                                    run.userStart?.name && h(
                                        '#user-start-tooltip.badge.bg-gray-light',
                                        tooltip(info(), `Run started by ${run.userStart?.name}`),
                                    ),
                                ]),
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
                                h('strong.flex-row.items-center.g2', [
                                    'O2 end',
                                    run.userStop?.name && h(
                                        '#user-stop-tooltip.badge.bg-gray-light',
                                        tooltip(info(), `Run stopped by ${run.userStop?.name}`),
                                    ),
                                ]),
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
                        h('.panel-header', h('.flex-row.flex-wrap.items-center.g2', [
                            'Detectors',
                            h('.badge.bg-white', run.nDetectors),
                            h('', '-'),
                            h('strong', 'Global quality: '),
                            formatRunQuality(runDetailsModel, run.runQuality, run),
                        ])),
                        h('#detectors.p2', formatRunDetectors(run, runDetailsModel)),
                    ]),
                    h('.flex-row.items-start.g2', [
                        h(PanelComponent, { class: 'flex-grow' }, [
                            h('.panel-header', 'Components'),
                            h('.flex-row.p2.items-center.g3', [
                                h('#n-epns.flex-column.items-center.flex-grow', [
                                    h('strong', '# EPNs'),
                                    run.epn
                                        ? typeof run.nEpns === 'number' ? run.nEpns : 'ON'
                                        : 'OFF',
                                ]),
                                h('#n-flps.flex-column.items-center.flex-grow', [
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
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'TF Orbits count'),
                                formatItemsCount(run.nTfOrbits),
                            ]),
                            h('strong', '|'),
                            h('.flex-column.items-center.flex-grow', [
                                h('strong', 'Other Files count'),
                                formatItemsCount(run.otherFileCount),
                            ]),
                        ]),
                    ]),
                    run.definition === RunDefinition.Physics && h('.flex-row.items-start.g2', [
                        h(PanelComponent, { class: 'flex-grow' }, [
                            h('.panel-header', 'INEL'),
                            h('.flex-row.p2.items-center.g3', [
                                run.pdpBeamType === PdpBeamType.PROTON_PROTON
                                    ? [
                                        h('.flex-column.items-center.flex-grow', [
                                            h('strong', `${GREEK_LOWER_MU_ENCODING}(INEL)`),
                                            h('#mu-inelastic-interaction-rate', formatFloat(run.muInelasticInteractionRate)),
                                        ]),
                                        h('strong', '|'),
                                    ]
                                    : [],
                                h('.flex-column.items-center.flex-grow', [
                                    h('strong', 'Average'),
                                    h('#inelastic-interaction-rate-avg', formatEditableNumber(
                                        runDetailsModel.isEditModeEnabled,
                                        runDetailsModel.runPatch.formData.inelasticInteractionRateAvg,
                                        ({ target: { value: inelasticInteractionRateAvg } }) =>
                                            runDetailsModel.runPatch.patchFormData({ inelasticInteractionRateAvg }),
                                        { unit: 'Hz' },
                                    )),
                                ]),
                                run.pdpBeamType === PdpBeamType.LEAD_LEAD
                                    ? [
                                        h('strong', '|'),
                                        h('.flex-column.items-center.flex-grow', [
                                            h('strong', 'At start'),
                                            h('#inelastic-interaction-rate-at-start', formatEditableNumber(
                                                runDetailsModel.isEditModeEnabled,
                                                runDetailsModel.runPatch.formData.inelasticInteractionRateAtStart,
                                                ({ target: { value: inelasticInteractionRateAtStart } }) =>
                                                    runDetailsModel.runPatch.patchFormData({ inelasticInteractionRateAtStart }),
                                                { unit: 'Hz' },
                                            )),
                                        ]),
                                        h('.flex-column.items-center.flex-grow', [
                                            h('strong', 'At Mid'),
                                            h('#inelastic-interaction-rate-at-mid', formatEditableNumber(
                                                runDetailsModel.isEditModeEnabled,
                                                runDetailsModel.runPatch.formData.inelasticInteractionRateAtMid,
                                                ({ target: { value: inelasticInteractionRateAtMid } }) =>
                                                    runDetailsModel.runPatch.patchFormData({ inelasticInteractionRateAtMid }),
                                                { unit: 'Hz' },
                                            )),
                                        ]),
                                        h('.flex-column.items-center.flex-grow', [
                                            h('strong', 'At end'),
                                            h('#inelastic-interaction-rate-at-end', formatEditableNumber(
                                                runDetailsModel.isEditModeEnabled,
                                                runDetailsModel.runPatch.formData.inelasticInteractionRateAtEnd,
                                                ({ target: { value: inelasticInteractionRateAtEnd } }) =>
                                                    runDetailsModel.runPatch.patchFormData({ inelasticInteractionRateAtEnd }),
                                                { unit: 'Hz' },
                                            )),
                                        ]),
                                    ]
                                    : [],
                            ]),
                        ]),
                        h(PanelComponent, { class: 'flex-grow', id: 'luminosity' }, [
                            h('.panel-header', 'Luminosity'),
                            h('.flex-row.p2.items-center.g3', luminosityPanel),
                        ]),
                    ]),
                    h('.flex-row.items-start.g2', [
                        h(PanelComponent, { class: 'flex-grow' }, [
                            h('.panel-header', h('.flex-row.items-center.justify-between', 'Configuration')),
                            h('.flex-column.p2.g2', [
                                h('.flex-row', [
                                    h('.flex-column.items-center.flex-grow', [
                                        h('strong', 'Run Definition'),
                                        h(
                                            '#definition.flex-row.flex-wrap.items-center.justify-center.g2',
                                            [
                                                run.definition || '-',
                                                h('#calibration-status', formatRunCalibrationStatus(runDetailsModel, run)),
                                            ],
                                        ),
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
                        h(
                            PanelComponent,
                            { class: 'flex-grow' },
                            [
                                h('.panel-header', h('.flex-row.items-center.justify-between', [
                                    'LHC',
                                    h(
                                        'span#fill-number',
                                        [
                                            'Fill ',
                                            frontLink(
                                                run.lhcFill?.fillNumber,
                                                'lhc-fill-details',
                                                { fillNumber: run.lhcFill?.fillNumber },
                                            ),
                                        ],
                                    ),
                                    frontLink(
                                        h('.flex-row.g2', [iconExternalLink(), 'Details']),
                                        'lhc-fill-details',
                                        { fillNumber: run.lhcFill?.fillNumber },
                                        { id: 'create-log', class: 'btn btn-primary btn-sm' },
                                    ),
                                ])),
                                run.lhcBeamMode === BeamModes.STABLE_BEAMS
                                    ? [
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
                                            h('.flex-row', [
                                                h('.flex-grow', [
                                                    h('strong', 'Trigger acceptance: '),
                                                    run.triggerAcceptance ?? '-',
                                                ]),
                                                h('.flex-grow', [
                                                    h('strong', 'X-sec: '),
                                                    run.crossSection ? `${run.crossSection} µb` : '-',
                                                ]),
                                            ]),
                                        ]),
                                    ]
                                    : h('#non-stable-beam-message.p2', `No LHC Fill information, beam mode was: ${run.lhcBeamMode}`),
                            ],
                        ),
                    ]),
                    h(PanelComponent, [
                        h('.panel-header', 'End of run reasons'),
                        h('.flex-column.p2.g2', [
                            h('#eor-reasons.flex-row', [
                                runDetailsModel.isEditModeEnabled
                                    ? editRunEorReasons(runDetailsModel)
                                    : h('.flex-column.g2', run.eorReasons.map((eorReason) => h('.eor-reason', formatEorReason(eorReason)))),
                            ]),
                        ]),
                    ]),
                ]),
            ]),
            h('', tabbedPanelComponent(
                runDetailsModel.tabbedPanelModel,
                {
                    [RUN_DETAILS_PANELS_KEYS.LOGS]: 'Log entries',
                    [RUN_DETAILS_PANELS_KEYS.FLPS]: 'FLP statistics',
                    [RUN_DETAILS_PANELS_KEYS.DPL_PROCESSES]: 'QC/PDP tasks',
                    [RUN_DETAILS_PANELS_KEYS.CTP_TRIGGER_COUNTERS]: 'Trigger counters',
                    [RUN_DETAILS_PANELS_KEYS.CTP_TRIGGER_CONFIGURATION]: 'CTP Trigger Config',
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
                    [RUN_DETAILS_PANELS_KEYS.CTP_TRIGGER_COUNTERS]: () => table(
                        remoteCtpTriggerCounters,
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
                    [RUN_DETAILS_PANELS_KEYS.CTP_TRIGGER_CONFIGURATION]: () => h(
                        PanelComponent,
                        h(
                            '.p2',
                            run.rawCtpTriggerConfiguration
                                ?.split('\n')
                                ?.map((row) => h('', row))
                            ?? h('em', 'No CTP trigger configuration'),
                        ),
                    ),
                },
            )),
        ];
    },
});
