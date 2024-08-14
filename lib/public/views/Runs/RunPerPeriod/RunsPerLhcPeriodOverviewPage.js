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
import { isRunNotSubjectToQc } from '../../../components/qcFlags/isRunSubjectToQc.js';
import { runDetectorsSyncQcActiveColumns } from '../ActiveColumns/runDetectorsSyncQcActiveColumns.js';
import { tabbedPanelComponent } from '../../../components/TabbedPanel/tabbedPanelComponent.js';
import { RUNS_PER_LHC_PERIOD_PANELS_KEYS } from './RunsPerLhcPeriodOverviewModel.js';

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
        lhcPeriodName,
        displayOptions,
        sortModel,
        tabbedPanelModel,
    } = perLhcPeriodOverviewModel;

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
    };

    /**
     * Render runs table with given detectors' active columns configuration
     *
     * @param {object} detectorsActiveColumns active columns
     * @return {Component} table with pagination
     */
    const getTableWithGivenDetectorsColumns = (detectorsActiveColumns) => h('.flex-column.w-100', [
        table(
            remoteDetectors.match({ Success: () => remoteRuns, Other: () => remoteDetectors }),
            {
                ...activeColumns,
                ...detectorsActiveColumns,
            },
            { classes: getRowClasses },
            {
                profile: 'runsPerLhcPeriod',
                ...displayOptions,
            },
            { sort: sortModel },
        ),
        paginationComponent(perLhcPeriodOverviewModel.pagination),
    ]);

    return h('', [
        h('.flex-row.justify-between.g2', [
            h('h2', `Good, physics runs of ${lhcPeriodName}`),
            exportRunsTriggerAndModal(perLhcPeriodOverviewModel, modalModel),
        ]),
        tabbedPanelComponent(
            tabbedPanelModel,
            {
                [RUNS_PER_LHC_PERIOD_PANELS_KEYS.DETECTOR_QUALITIES]: 'Qualities of detectors',
                [RUNS_PER_LHC_PERIOD_PANELS_KEYS.SYNCHRONOUS_FLAGS]: 'Synchronous QC flags',
            },
            {
                [RUNS_PER_LHC_PERIOD_PANELS_KEYS.DETECTOR_QUALITIES]:
                    () => getTableWithGivenDetectorsColumns(runDetectorsQualitiesActiveColumns(
                        remoteDetectors.match({ Success: (payload) => payload, Other: () => [] }),
                        { profiles: 'runsPerLhcPeriod' },
                    )),

                [RUNS_PER_LHC_PERIOD_PANELS_KEYS.SYNCHRONOUS_FLAGS]:
                    (remoteSynchronousQcSummary) => getTableWithGivenDetectorsColumns(runDetectorsSyncQcActiveColumns(
                        remoteDetectors.match({ Success: (payload) => payload, Other: () => [] }),
                        {
                            profiles: 'runsPerLhcPeriod',
                            qcSummary: remoteSynchronousQcSummary.match({ Success: (qcSummary) => qcSummary, Other: () => null }),
                        },
                    )),
            },
        ),

    ]);
};
