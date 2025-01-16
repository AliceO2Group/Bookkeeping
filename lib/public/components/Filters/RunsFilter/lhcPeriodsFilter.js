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
 * Returns the lhc periods filter component.
 *
 * @param {RawTextFilterModel} lhcPeriodsFilterModel the filter model
 * @return {Component} the LHC periods filter component
 */
export const lhcPeriodsFilter = (lhcPeriodsFilterModel) => h(
    'input.w-75.mt1',
    {
        type: 'lhcPeriod',
        id: 'lhcPeriods',
        placeholder: 'e.g. LHC22b, LHC22a...',
        value: lhcPeriodsFilterModel.value,
        oninput: (e) => {
            lhcPeriodsFilterModel.value = e.target.value;
        },
    },
    '',
);
