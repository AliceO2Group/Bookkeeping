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
import { exportRunsTriggerAndModal } from '../Overview/exportRunsTriggerAndModal.js';
import { runsActiveColumns } from '../ActiveColumns/runsActiveColumns.js';
import { runDetectorsQualitiesActiveColumns } from '../ActiveColumns/runDetectorsQualitiesActiveColumns.js';
import { inelasticInteractionRateActiveColumnsForProtonProton } from '../ActiveColumns/inelasticInteractionRateActiveColumnsForProtonProton.js';
import { inelasticInteractionRateActiveColumnsForPbPb } from '../ActiveColumns/inelasticInteractionRateActiveColumnsForPbPb.js';
import { isRunNotSubjectToQc } from '../../../components/qcFlags/isRunNotSubjectToQc.js';
import { runDetectorsSyncQcActiveColumns } from '../ActiveColumns/runDetectorsSyncQcActiveColumns.js';
import { tabbedPanelComponent } from '../../../components/TabbedPanel/tabbedPanelComponent.js';
import { RUNS_PER_LHC_PERIOD_PANELS_KEYS } from './RunsPerLhcPeriodOverviewModel.js';
import { PdpBeamType } from '../../../domain/enums/PdpBeamType.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
import { runNumbersFilter } from '../../../components/Filters/RunsFilter/runNumbersFilter.js';
import { mergeRemoteData } from '../../../utilities/mergeRemoteData.js';
import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';

const TABLEROW_HEIGHT = 62;
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
 *
 * @param {Model} model The overall model object.
 * @param {Model} [model.runs.perLhcPeriodOverviewModel] model holding state for of the page
 * @return {Component} The overview page
 */
export const RunsPerLhcPeriodOverviewPage = ({ runs: { perLhcPeriodOverviewModel }, modalModel }) => {
    perLhcPeriodOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const {
        items: remoteRuns,
        detectors: remoteDetectors,
        lhcPeriod: remoteLhcPeriod,
        displayOptions,
        sortModel,
        tabbedPanelModel,
    } = perLhcPeriodOverviewModel;

    const activeColumns = {

    };

    /**
     * Render runs table with given detectors' active columns configuration
     *
     * @param {Run[]} runs runs
     * @param {object} detectorsActiveColumns active columns
     * @return {Component} table with pagination
     */
    const getTableWithGivenDetectorsColumns = (runs, detectorsActiveColumns) =>
        table(

            /*
             * Columns depends on detectors' list, it's not useful to render the table when detectors are missing
             */
            remoteRuns,
            {
                ...runsActiveColumns,
                ...runs.some((run) => run.pdpBeamType === PdpBeamType.LEAD_LEAD) ? inelasticInteractionRateActiveColumnsForPbPb : {},
                ...runs.some((run) => run.pdpBeamType === PdpBeamType.PROTON_PROTON)
                    ? inelasticInteractionRateActiveColumnsForProtonProton : {},
                ...detectorsActiveColumns,
            },
            { classes: getRowClasses },
            {
                profile: 'runsPerLhcPeriod',
                ...displayOptions,
                singleWrapper: true,
            },
            { sort: sortModel },
        );

    return h(
        '.intermediate-flex-column',
        { onremove: () => perLhcPeriodOverviewModel.reset(false) },
        mergeRemoteData([remoteLhcPeriod, remoteRuns, remoteDetectors]).match({
            NotAsked: () => null,
            Failure: (errors) => errorAlert(errors),
            Loading: () => spinner(),
            Success: ([lhcPeriod, runs, detectors]) => [
                h('.flex-row.justify-between.items-center.g2', [
                    filtersPanelPopover(perLhcPeriodOverviewModel, activeColumns, { profile: 'runsPerLhcPeriod' }),
                    h('.pl2#runOverviewFilter', runNumbersFilter(perLhcPeriodOverviewModel.filteringModel.get('runNumbers'))),
                    h('h2', `Good, physics runs of ${lhcPeriod.lhcPeriod.name}`),

                    exportRunsTriggerAndModal(perLhcPeriodOverviewModel, modalModel),
                ]),
                ...tabbedPanelComponent(
                    tabbedPanelModel,
                    {
                        [RUNS_PER_LHC_PERIOD_PANELS_KEYS.DETECTOR_QUALITIES]: 'Qualities of detectors',
                        [RUNS_PER_LHC_PERIOD_PANELS_KEYS.SYNCHRONOUS_FLAGS]: 'Synchronous QC flags',
                    },
                    {
                        [RUNS_PER_LHC_PERIOD_PANELS_KEYS.DETECTOR_QUALITIES]:
                        () => getTableWithGivenDetectorsColumns(
                            runs,
                            runDetectorsQualitiesActiveColumns(detectors, { profiles: 'runsPerLhcPeriod' }),
                        ),

                        [RUNS_PER_LHC_PERIOD_PANELS_KEYS.SYNCHRONOUS_FLAGS]:
                            (remoteSynchronousQcSummary) => getTableWithGivenDetectorsColumns(runs, runDetectorsSyncQcActiveColumns(detectors, {
                                profiles: 'runsPerLhcPeriod',
                                qcSummary: remoteSynchronousQcSummary?.match({ Success: (qcSummary) => qcSummary, Other: () => null }),
                            })),
                    },
                    { panelClass: ['scroll-auto'] },
                ),
                paginationComponent(perLhcPeriodOverviewModel.pagination),
            ],
        }),

    );
};
