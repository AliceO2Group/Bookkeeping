/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { lhcPeriodsActiveColumns } from '../ActiveColumns/lhcPeriodsActiveColumns.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';

/**
 * The function to load the lhcPeriods overview
 * @param {Model} lhcPeriodsOverviewModel The overall model object.
 * @returns {vnode} The overview screen
 */
export const LhcPeriodsPage = (lhcPeriodsOverviewModel) => h('', {
    onremove: () => lhcPeriodsOverviewModel.reset(),
}, [
    h('.w-100.flex-column', [
        table(lhcPeriodsOverviewModel.lhcPeriods, lhcPeriodsActiveColumns, { classes: '.table-sm' }),
        paginationComponent(lhcPeriodsOverviewModel.pagination),
    ]),
]);
