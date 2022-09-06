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
 * Returns the lhc period filter component.
 * @param {RunModel} runModel The run model object
 * @return {vnode} A text box that lets the user look for logs with a specific author
 */
const lhcPeriodsFilter = (runModel) => h('input.w-75.mt1', {
    type: 'lhcPeriod',
    id: 'lhcPeriods',
    placeholder: 'e.g. lhc22b, lhc22a...',
    value: runModel.lhcPeriodsFilter,
    oninput: (e) => {
        runModel.lhcPeriodsFilter = e.target.value;
    },
}, '');

export default lhcPeriodsFilter;
