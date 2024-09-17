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

import { h, iconWarning, switchCase } from '/js/src/index.js';
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
import { floatNumberFilter } from '../../../components/Filters/common/filters/floatNumberFilter.js';
import { PdpBeamType } from '../../../domain/enums/PdpBeamType.js';
import { SkimmingStage } from '../../../domain/enums/SkimmingStage.js';
import { badge } from '../../../components/common/badge.js';
import { Color } from '../../../components/common/colors.js';
import { mergeRemoteData } from '../../../utilities/mergeRemoteData.js';

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
const mcReproducibleAsNotBadToggle = (value, onChange) => h('#mcReproducibleAsNotBadToggle', switchInput(
    value,
    onChange,
    { labelAfter: h('em', 'MC.R as not-bad') },
));

/**
 * Render (if applies to type of current data pass) button to mark current data pass as skimmable,
 * if it's skimmable already, badge with this information is rendered instead
 *
 * @param {DataPass} dataPass data pass
 * @param {function} onclick onclick action
 * @param {RemoteData} requestResult remote data of result of request for marking data pass as skimmable
 * @return {Component} badge or button
 */
const skimmableControl = (dataPass, onclick, requestResult) => {
    const { name, pdpBeamType, skimmingStage } = dataPass;
    const skimmableIndicator = badge('Skimmable', { color: Color.SUCCESS });
    if (skimmingStage === SkimmingStage.SKIMMABLE) {
        return skimmableIndicator;
    }

    const validSkimmableProductionNameRegex = /_apass\d+(?!.*(skimming|skimmed|debug|test))/;
    if (validSkimmableProductionNameRegex.test(name) && pdpBeamType === PdpBeamType.PROTON_PROTON) {
        const buttonContent = 'Mark as skimmable';
        return requestResult.match({
            Success: () => skimmableIndicator,
            Failure: () => h('button.btn.primary', { onclick }, [tooltip(iconWarning(), 'Error occurred when sending request'), buttonContent]),
            Loading: () => h('button.btn.primary', { disabled: true }, h('.flex-row', ['Sending request...'])),
            NotAsked: () => h('button.btn.primary', { onclick }, buttonContent),
        });
    }
};

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
        pdpBeamType,
        markAsSkimmableRequestResult,
        skimmableRuns: remoteSkimmableRuns,
    } = perDataPassOverviewModel;

    const activeColumns = {
        ...runsActiveColumns,
        ...switchCase(pdpBeamType, {
            [PdpBeamType.PROTON_PROTON]: inelasticInteractionRateActiveColumnsForProtonProton,
            [PdpBeamType.LEAD_LEAD]: inelasticInteractionRateActiveColumnsForPbPb,
        }, {
            ...inelasticInteractionRateActiveColumnsForProtonProton,
            ...inelasticInteractionRateActiveColumnsForPbPb,
        }),
        ...remoteDataPass.match({
            Success: ({ skimmingStage }) => skimmingStage === SkimmingStage.SKIMMABLE
                ? {
                    readyForSkimming: {
                        name: 'Ready for skimming',
                        visible: true,
                        format: (_, { runNumber }) => remoteSkimmableRuns.match({
                            Success: (skimmableRuns) => switchInput(
                                skimmableRuns[runNumber],
                                () => perDataPassOverviewModel.changeReadyForSkimmingFlagForRun(runNumber),
                                {
                                    labelAfter: skimmableRuns[runNumber]
                                        ? badge('ready', { color: Color.GREEN })
                                        : badge('not ready', { color: Color.WARNING_DARKER }),
                                },
                            ),
                            Loading: () => h('.mh3.ph4', '... ...'),
                            Failure: () => tooltip(iconWarning(), 'Error occurred'),
                            NotAsked: () => tooltip(iconWarning(), 'Not asked for data'),
                        }),
                        profiles: ['runsPerDataPass'],
                    },
                }
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
                    filter: ({ gaqNotBadFractionFilterModel }) => floatNumberFilter(
                        gaqNotBadFractionFilterModel,
                        { selectorPrefix: 'gaqNotBadFraction' },
                    ),
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

    return h('', { onremove: () => perDataPassOverviewModel.reset(false) }, [
        h('.flex-row.justify-between.items-center.g2', [
            filtersPanelPopover(perDataPassOverviewModel, activeColumns, { profile: 'runsPerDataPass' }),
            h('.pl2#runOverviewFilter', runNumberFilter(perDataPassOverviewModel)),
            h(
                '.flex-row.g1.items-center',
                remoteDataPass.match({
                    Success: (dataPass) => h('.flex-row.items-center.g1', [
                        breadcrumbs([commonTitle, h('h2', dataPass.name)]),
                        h('#skimmableControl', skimmableControl(
                            dataPass,
                            () => {
                                if (confirm('The data pass is going to be set as skimmable. Do you want to continue?')) {
                                    perDataPassOverviewModel.markDataPassAsSkimmable();
                                }
                            },
                            markAsSkimmableRequestResult,
                        )),
                    ]),
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
        markAsSkimmableRequestResult.match({
            Failure: (errors) => errorAlert(errors),
            Other: () => null,
        }),
        h('.flex-column.w-100', [
            table(
                mergeRemoteData([remoteRuns, remoteDetectors, remoteGaqSummary, remoteQcSummary])
                    .apply({ Success: ([remoteRunsPayload]) => remoteRunsPayload }),
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
