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

const TABLEROW_HEIGHT = 46;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * The shows the environment table
 * @param {PaginationModel} pagination the environment's pagination model
 * @param {RemoteData} envs Environment objects.
 * @returns {Object} Html page
 */
export const environmentOverviewComponent = (pagination, envs) => {
    pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    return [
        h('.w-100.flex-column', [
            h('.header-container.pv2'),
            table(envs, environmentsActiveColumns, { classes: getRowsClasses }),
            paginationComponent(pagination),
        ]),
    ];
};

/**
 * Takes an environment, checks it's status and status history and returns the relevant css class.
 * @param {Environment} environment the environment to be formatted
 * @returns {string} CSS class
 */
const getRowsClasses = (environment) => {
    const hasOrHadError = environment.status === 'ERROR' || environment.historyItems.some((item) => item.status === 'ERROR');
    return `.table-sm${hasOrHadError ? '.danger' : ''}`;
};
