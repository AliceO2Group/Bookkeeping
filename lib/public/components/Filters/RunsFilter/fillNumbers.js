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
 * Returns a filter component to filter on a list of fill numbers
 *
 * @param {Model} model The global model object
 *
 * @return {vnode} A text box that allows the user to enter a list of fill numbers
 */
const fillNumbers = (model) => h('input.w-75.mt1', {
    type: 'text',
    id: 'fillNumbers',
    value: model.runs.getFillNumbersFilter(),
    placeholder: 'e.g. 7966, 7954, 7948...',
    oninput: (e) => model.runs.setFillNumbersFilter(e.target.value),
}, '');

export default fillNumbers;
