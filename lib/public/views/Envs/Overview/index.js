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
import { envsActiveColumns } from '../ActiveColumns/envsActiveColumns.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';

const TABLEROW_HEIGHT = 46;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * The function to load the environment overview
 * @param {Model} model The overall model object.
 * @returns {Object} The overview screen
 */
const envOverviewScreen = (model) => h(
    '',
    {
        onremove: () => model.envs.clearEnvs(),
    },
    showEnvsTable(model, model.envs.envs),
);

/**
 * The shows the environment table
 * @param {Model} model The overall model object.
 * @param {RemoteData} envs Environment objects.
 * @returns {Object} Html page
 */
const showEnvsTable = (model, envs) => {
    model.envs.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    return [
        h('.w-100.flex-column', [
            h('.header-container.pv2'),
            table(envs, envsActiveColumns, { classes: '.table-sm' }),
            paginationComponent(model.envs.pagination),
        ]),
    ];
};

export default (model) => [envOverviewScreen(model)];
