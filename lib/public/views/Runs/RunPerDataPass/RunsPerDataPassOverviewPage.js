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
import { createRunDetectorsActiveColumns } from '../ActiveColumns/runDetectorsActiveColumns.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { exportRunsTriggerAndModal } from '../Overview/exportRunsTriggerAndModal.js';
import { runsActiveColumns } from '../ActiveColumns/runsActiveColumns.js';
import spinner from '../../../components/common/spinner.js';

const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Runs Per LHC Period overview page
 * @param {Model} model The overall model object.
 * @param {Model} [model.runs.perDataPassOverviewModel] model holding state for of the page
 * @return {Component} The overview page
 */
export const RunsPerDataPassOverviewPage = ({ runs: { perDataPassOverviewModel }, modalModel }) => {
    perDataPassOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const { items: runs, detectors, dataPass } = perDataPassOverviewModel;

    const activeColumns = {
        ...runsActiveColumns,
        ...createRunDetectorsActiveColumns(detectors.match({
            Success: (payload) => payload,
            Other: () => [],
        }), { profiles: 'runsPerDataPass' }),
    };

    return h('', [
        h('.flex-row.justify-between.items-center', [
            dataPass.match({
                Success: (payload) => h('h2', `Good, physics runs of ${payload.name}`),
                Failure: () => h('h2.danger', 'Failed to fetch Data Pass information'),
                Loading: () => h('.p1', spinner({ size: 2, absolute: false })),
                NotAsked: () => h('h2', 'Good, physics runs'),
            }),
            exportRunsTriggerAndModal(perDataPassOverviewModel, modalModel),
        ]),
        h('.flex-column.w-100', [
            table(runs, activeColumns, null, { profile: 'runsPerDataPass', xScrollable: true, leftSticky: true }),
            paginationComponent(perDataPassOverviewModel.pagination),
        ]),
    ]);
};
