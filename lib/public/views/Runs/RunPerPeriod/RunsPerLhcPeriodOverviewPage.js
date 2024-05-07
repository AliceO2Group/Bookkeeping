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
import { createRunDetectorsSyncQcActiveColumns } from '../ActiveColumns/runDetectorsSyncQcActiveColumns.js';
import { inelasticInteractionRateActiveColumnsForProtonProton } from '../ActiveColumns/inelasticInteractionRateActiveColumnsForProtonProton.js';
import { inelasticInteractionRateActiveColumnsForPbPb } from '../ActiveColumns/inelasticInteractionRateActiveColumnsForPbPb.js';

const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Runs Per LHC Period overview page
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
        displayXScrollable,
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
        ...createRunDetectorsSyncQcActiveColumns(remoteDetectors.match({
            Success: (payload) => payload,
            Other: () => [],
        }), { profiles: 'runsPerLhcPeriod' }),
    };

    return h('', [
        h('.flex-row.justify-between.items-center.g2', [
            h('h2', `Good, physics runs of ${lhcPeriodName}`),
            exportRunsTriggerAndModal(perLhcPeriodOverviewModel, modalModel),
        ]),
        h('.flex-column.w-100', [
            table(
                remoteDetectors.match({
                    Success: () => remoteRuns,
                    Other: () => remoteDetectors,
                }),
                activeColumns,
                null,
                {
                    profile: 'runsPerLhcPeriod',
                    xScrollable: displayXScrollable,
                },
            ),
            paginationComponent(perLhcPeriodOverviewModel.pagination),
        ]),
    ]);
};
