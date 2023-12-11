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
import { RunsPeriodActiveColumns, getDetectorsActiveColumns } from '../ActiveColumns/runsPerPeriodActiveColumns.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';

const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Runs Per LHC Period overview page
 * @param {Model} model The overall model object.
 * @param {Model} [model.runsPerPeriodModel] model holding state for of the page
 * @return {Component} The overview page
 */
export const RunsPerPeriodPage = ({ runs: { perPeriodOverviewModel } }) => {
    perPeriodOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const activeColumns = {
        ...RunsPeriodActiveColumns,
        ...getDetectorsActiveColumns(perPeriodOverviewModel.detectors.payload),
    };

    return h('.flex-column.w-100', [
        table(perPeriodOverviewModel.runs, activeColumns),
        paginationComponent(perPeriodOverviewModel.pagination),
    ]);
};
