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

/**
 * Returns a filter component to filter on environment ids (comma separated list)
 *
 * @param {RawTextFilterModel} filterModel the filter model
 * @return {Component} the environment ids filter
 */
export const environmentIdsFilter = (filterModel) => h(
    'input.w-75.mt1',
    {
        type: 'text',
        id: 'environment-ids-filter',
        value: filterModel.value,
        placeholder: 'e.g. Dxi029djX, TDI59So3d...',
        onchange: (e) => {
            filterModel.value = e.target.value;
        },
    },
    '',
);
