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
 * Returns the title filter component
 * @param {LogModel} logModel the log model object
 * @return {vnode} A text box that allows the user to enter a title substring to match against all logs
 */
const titleFilter = ({ titleFilter }) => h('input.w-75.mt1', {
    type: 'text',
    id: 'titleFilterText',
    value: titleFilter.raw,
    oninput: (e) => titleFilter.update(e.target.value),
}, '');

export default titleFilter;
