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
import { environmentsActiveColumns } from '../ActiveColumns/environmentsActiveColumns.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';

const TABLEROW_HEIGHT = 58;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 181;

/**
 * The shows the environment table
 * @param {OverviewModel} envsOverviewModel the environment's overview model
 * @returns {Object} Html page
 */
export const environmentOverviewComponent = (envsOverviewModel) => {
    const { pagination, environments } = envsOverviewModel;

    pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    return h('', [
        h(
            '.flex-row.header-container.g2.pv2',
            filtersPanelPopover(envsOverviewModel, environmentsActiveColumns),
        ),
        h('.w-100.flex-column', [
            h('.header-container.pv2'),
            table(environments, environmentsActiveColumns, { classes: 'table-sm' }),
            paginationComponent(pagination),
        ]),
    ]);
};
