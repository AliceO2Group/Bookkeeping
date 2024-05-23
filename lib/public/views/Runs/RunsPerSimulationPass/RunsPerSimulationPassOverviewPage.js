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

import { h, iconWarning } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { exportRunsTriggerAndModal } from '../Overview/exportRunsTriggerAndModal.js';
import { runsActiveColumns } from '../ActiveColumns/runsActiveColumns.js';
import { breadcrumbs } from '../../../components/common/navigation/breadcrumbs.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import spinner from '../../../components/common/spinner.js';
import { createRunDetectorsAsyncQcActiveColumns } from '../ActiveColumns/runDetectorsAsyncQcActiveColumns.js';
import { inelasticInteractionRateActiveColumnsForPbPb } from '../ActiveColumns/inelasticInteractionRateActiveColumnsForPbPb.js';
import { inelasticInteractionRateActiveColumnsForProtonProton } from '../ActiveColumns/inelasticInteractionRateActiveColumnsForProtonProton.js';
import { qcSummaryLegendTooltip } from '../../../components/qcFlags/qcSummaryLegendTooltip.js';

const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Runs Per LHC Period overview page
 * @param {Model} model The overall model object.
 * @return {Component} The overview page
 */
export const RunsPerSimulationPassOverviewPage = ({
    runs: { perSimulationPassOverviewModel: runsPerSimulationPassOverviewModel },
    modalModel }) => {
    runsPerSimulationPassOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const {
        items: remoteRuns,
        detectors: remoteDetectors,
        simulationPass: remoteSimulationPass,
        qcSummary: remoteQcSummary,
        displayOptions,
    } = runsPerSimulationPassOverviewModel;

    const activeColumns = {
        ...runsActiveColumns,
        ...remoteRuns.match({
            Success: (runs) => runs.some((run) => run.pdpBeamType === 'PbPb')
                ? inelasticInteractionRateActiveColumnsForPbPb
                : {},
            Other: () => {},
        }),
        ...remoteRuns.match({
            Success: (runs) => runs.some((run) => run.pdpBeamType === 'pp')
                ? inelasticInteractionRateActiveColumnsForProtonProton
                : {},
            Other: () => {},
        }),
        ...createRunDetectorsAsyncQcActiveColumns(remoteDetectors.match({
            Success: (detectors) => detectors,
            Other: () => [],
        }), {
            profiles: ['runsPerSimulationPass'],
            simulationPassId: remoteSimulationPass.match({
                Success: (simulationPass) => simulationPass.id,
                Other: () => null,
            }),
            qcSummary: remoteQcSummary.match({
                Success: (qcSummary) => qcSummary,
                Other: () => null,
            }),
        }),
    };

    const commonTitle = h('h2', 'Runs per MC');
    return h('', [
        h('.flex-row.justify-between.items-center.g2', [
            h(
                '.flex-row.g1.items-center',
                remoteSimulationPass.match({
                    Success: ({ name }) => breadcrumbs([commonTitle, h('h2', name)]),
                    Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to load simulation pass info')],
                    Loading: () => [commonTitle, h('', spinner({ size: 2, absolute: false }))],
                    NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No data was asked for')],
                }),
            ),
            h('.mlauto', qcSummaryLegendTooltip()),
            exportRunsTriggerAndModal(runsPerSimulationPassOverviewModel, modalModel, { autoMarginLeft: false }),
        ]),
        h('.flex-column.w-100', [
            table(
                remoteRuns,
                activeColumns,
                null,
                {
                    profile: 'runsPerSimulationPass',
                    ...displayOptions,
                },
            ),
            paginationComponent(runsPerSimulationPassOverviewModel.pagination),
        ]),
    ]);
};
