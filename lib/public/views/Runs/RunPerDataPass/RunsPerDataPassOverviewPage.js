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
import spinner from '../../../components/common/spinner.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { breadcrumbs } from '../../../components/common/navigation/breadcrumbs.js';
import { createRunDetectorsAsyncQcActiveColumns } from '../ActiveColumns/runDetectorsAsyncQcActiveColumns.js';
import { inelasticInteractionRateActiveColumnsForPbPb } from '../ActiveColumns/inelasticInteractionRateActiveColumnsForPbPb.js';
import { inelasticInteractionRateActiveColumnsForProtonProton } from '../ActiveColumns/inelasticInteractionRateActiveColumnsForProtonProton.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
import runNumberFilter from '../../../components/Filters/RunsFilter/runNumber.js';
import { qcSummaryLegendTooltip } from '../../../components/qcFlags/qcSummaryLegendTooltip.js';
import { isRunNotSubjectToQc } from '../../../components/qcFlags/isRunSubjectToQc.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { getQcSummaryDisplay } from '../ActiveColumns/getQcSummaryDisplay.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { switchInput } from '../../../components/common/form/switchInput.js';

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
 * Display a toggle switch to change interpretation of MC.Reproducible flag type from bad to not-bad
 *
 * @param {boolean} value current value
 * @param {function} onChange to be called when switching
 * @returns {Component} the toggle switch
 */
export const mcReproducibleAsNotBadToggle = (value, onChange) => h('#mcReproducibleAsNotBadToggle', switchInput(
    value,
    onChange,
    { labelAfter: h('em', 'MC.R as not-bad') },
));

/**
 * Render Runs Per LHC Period overview page
 * @param {Model} model The overall model object.
 * @param {Model} [model.runs.perDataPassOverviewModel] model holding state for of the page
 * @return {Component} The overview page
 */
export const RunsPerDataPassOverviewPage = ({
    runs: { perDataPassOverviewModel },
    dplDetectorsUserHasAccessTo: remoteDplDetectorsUserHasAccessTo,
    modalModel,
}) => {
    perDataPassOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const {
        items: remoteRuns,
        detectors: remoteDetectors,
        dataPass: remoteDataPass,
        qcSummary: remoteQcSummary,
        gaqSummary: remoteGaqSummary,
        displayOptions,
        dataPassId,
        sortModel,
        mcReproducibleAsNotBad,
    } = perDataPassOverviewModel;

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
        ...remoteGaqSummary.match({
            Success: (gaqSummary) => ({
                globalAggregatedQuality: {
                    name: 'GAQ',
                    visible: true,
                    format: (_, { runNumber }) => {
                        const runGaqSummary = gaqSummary[runNumber];
                        const gaqDisplay = runGaqSummary
                            ? getQcSummaryDisplay(runGaqSummary, { mcReproducibleAsNotBad })
                            : h('button.btn.btn-primary.w-100', 'GAQ');

                        return frontLink(gaqDisplay, 'gaq-flags', { dataPassId, runNumber });
                    },
                    profiles: ['runsPerDataPass'],
                },
            }),
            Other: () => ({}),
        }),
        ...dataPassId && createRunDetectorsAsyncQcActiveColumns(
            remoteDetectors.match({
                Success: (payload) => payload,
                Other: () => [],
            }),
            remoteDplDetectorsUserHasAccessTo,
            { dataPassId },
            {
                profiles: 'runsPerDataPass',
                qcSummary: remoteQcSummary.match({
                    Success: (qcSummary) => qcSummary,
                    Other: () => null,
                }),
                mcReproducibleAsNotBad,
            },
        ),
    };

    const commonTitle = h('h2', { style: 'white-space: nowrap;' }, 'Physics Runs');

    return h('', [
        h('.flex-row.justify-between.items-center.g2', [
            filtersPanelPopover(perDataPassOverviewModel, runsActiveColumns, { profile: 'runsPerDataPass' }),
            h('.pl2#runOverviewFilter', runNumberFilter(perDataPassOverviewModel)),
            h(
                '.flex-row.g1.items-center',
                remoteDataPass.match({
                    Success: (payload) => breadcrumbs([commonTitle, h('h2', payload.name)]),
                    Failure: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'Not able to fetch data pass info')],
                    Loading: () => [commonTitle, spinner({ size: 2, absolute: false })],
                    NotAsked: () => [commonTitle, tooltip(h('.f3', iconWarning()), 'No data was asked for')],
                }),
            ),
            mcReproducibleAsNotBadToggle(
                mcReproducibleAsNotBad,
                () => perDataPassOverviewModel.setMcReproducibleAsNotBad(!mcReproducibleAsNotBad),
            ),

            h('.mlauto', qcSummaryLegendTooltip()),
            exportRunsTriggerAndModal(perDataPassOverviewModel, modalModel, { autoMarginLeft: false }),
        ]),
        h('.flex-column.w-100', [
            remoteGaqSummary.match({ Failure: (errors) => errorAlert(errors), Other: () => null }),
            table(
                remoteRuns,
                activeColumns,
                { classes: getRowClasses },
                {
                    profile: 'runsPerDataPass',
                    ...displayOptions,
                },
                { sort: sortModel },
            ),
            paginationComponent(perDataPassOverviewModel.pagination),
        ]),
    ]);
};
