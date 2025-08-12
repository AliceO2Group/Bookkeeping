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
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { runsActiveColumns } from '../ActiveColumns/runsActiveColumns.js';
import { breadcrumbs } from '../../../components/common/navigation/breadcrumbs.js';
import spinner from '../../../components/common/spinner.js';
import { createRunDetectorsAsyncQcActiveColumns } from '../ActiveColumns/runDetectorsAsyncQcActiveColumns.js';
import { inelasticInteractionRateActiveColumnsForPbPb } from '../ActiveColumns/inelasticInteractionRateActiveColumnsForPbPb.js';
import { inelasticInteractionRateActiveColumnsForProtonProton } from '../ActiveColumns/inelasticInteractionRateActiveColumnsForProtonProton.js';
import { qcSummaryLegendTooltip } from '../../../components/qcFlags/qcSummaryLegendTooltip.js';
import { isRunNotSubjectToQc } from '../../../components/qcFlags/isRunNotSubjectToQc.js';
import { PdpBeamType } from '../../../domain/enums/PdpBeamType.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { mergeRemoteData } from '../../../utilities/mergeRemoteData.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { exportTriggerAndModal } from '../../../components/common/dataExport/exportTriggerAndModal.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
import { runNumbersFilter } from '../../../components/Filters/RunsFilter/runNumbersFilter.js';
import { mcReproducibleAsNotBadToggle } from '../mcReproducibleAsNotBadToggle.js';

const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Return specific classes to style row of run which is not subject to QC
 *
 * @param {Run} run a run
 * @return {string|null} css classes
 */
const getRowClasses = (run) => isRunNotSubjectToQc(run) ? '.danger' : null;

/**
 * Render Runs Per LHC Period overview page
 * @param {Model} model The overall model object.
 * @return {Component} The overview page
 */
export const RunsPerSimulationPassOverviewPage = ({
    runs: { perSimulationPassOverviewModel },
    dplDetectorsUserHasAccessTo: remoteDplDetectorsUserHasAccessTo,
    modalModel,
}) => {
    perSimulationPassOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const {
        items: remoteRuns,
        detectors: remoteDetectors,
        simulationPass: remoteSimulationPass,
        simulationPassId,
        qcSummary: remoteQcSummary,
        displayOptions,
        sortModel,
        mcReproducibleAsNotBad,
    } = perSimulationPassOverviewModel;

    const commonTitle = h('h2', 'Runs per MC');

    return h(
        '.intermediate-flex-column',
        { onremove: () => perSimulationPassOverviewModel.reset(false) },
        mergeRemoteData([remoteSimulationPass, remoteRuns, remoteDetectors, remoteQcSummary]).match({
            NotAsked: () => null,
            Failure: (errors) => errorAlert(errors),
            Success: ([simulationPass, runs, detectors, qcSummary]) => {
                const activeColumns = {
                    ...runsActiveColumns,
                    ...runs.some((run) => run.pdpBeamType === PdpBeamType.LEAD_LEAD) ? inelasticInteractionRateActiveColumnsForPbPb : {},
                    ...runs.some((run) => run.pdpBeamType === PdpBeamType.PROTON_PROTON)
                        ? inelasticInteractionRateActiveColumnsForProtonProton : {},
                    ...createRunDetectorsAsyncQcActiveColumns(
                        perSimulationPassOverviewModel.runDetectorsSelectionModel,
                        detectors,
                        remoteDplDetectorsUserHasAccessTo,
                        { simulationPass },
                        {
                            profile: 'runsPerSimulationPass',
                            qcSummary,
                        },
                    ),
                };

                return [
                    h('.flex-row.justify-between.items-center.g2', [
                        filtersPanelPopover(perSimulationPassOverviewModel, activeColumns, { profile: 'runsPerSimulationPass' }),
                        h('.pl2#runOverviewFilter', runNumbersFilter(perSimulationPassOverviewModel.filteringModel.get('runNumbers'))),
                        h(
                            '.flex-row.g1.items-center',
                            breadcrumbs([commonTitle, h('h2#breadcrumb-simulation-pass-name', simulationPass.name)]),
                        ),
                        mcReproducibleAsNotBadToggle(
                            mcReproducibleAsNotBad,
                            () => perSimulationPassOverviewModel.setMcReproducibleAsNotBad(!mcReproducibleAsNotBad),
                        ),
                        h('.mlauto', qcSummaryLegendTooltip()),
                        exportTriggerAndModal(perSimulationPassOverviewModel.exportModel, modalModel, { autoMarginLeft: false }),
                        frontLink(
                            h(
                                'button.btn.btn-primary.w-100.h2}#set-qc-flags-trigger',
                                {
                                    disabled: perSimulationPassOverviewModel.runDetectorsSelectionModel.selectedQueryString.length < 1,
                                },
                                'Set QC Flags',
                            ),
                            'qc-flag-creation-for-simulation-pass',
                            {
                                runNumberDetectorsMap: perSimulationPassOverviewModel.runDetectorsSelectionModel.selectedQueryString,
                                simulationPassId,
                            },
                        ),
                    ]),
                    table(
                        runs,
                        activeColumns,
                        { classes: getRowClasses },
                        {
                            profile: 'runsPerSimulationPass',
                            ...displayOptions,
                        },
                        { sort: sortModel },
                    ),
                    paginationComponent(perSimulationPassOverviewModel.pagination),
                ];
            },
            Loading: () => spinner(),
        }),
    );
};
