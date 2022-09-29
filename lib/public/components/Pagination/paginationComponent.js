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
import { amountSelector, pageSelector } from './index.js';

/**
 * Returns a pagination component, including the amount selector and the pages list
 *
 * @param {PaginationModel} pagination the pagination's model
 * @returns {vnode} the component
 */
export const paginationComponent = (pagination) => pagination.pagesCount > 0
    ? h('.flex-row.justify-between.pv3', [
        h('.w-15', amountSelector(pagination)),
        pageSelector(pagination),
        h('.w-15'),
    ])
    : null;
