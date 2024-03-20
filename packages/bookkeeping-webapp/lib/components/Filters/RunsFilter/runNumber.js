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
 * Returns the author filter component
 * @param {RunsOverviewModel} runsOverviewModel the runs overview model
 * @return {vnode} A text box that lets the user look for logs with a specific author
 */
const runNumberFilter = (runsOverviewModel) => h('input', {
    type: 'text',
    id: 'runNumber',
    value: runsOverviewModel.getRunNumberFilter(),
    placeholder: 'e.g. 534454, 534455...',
    oninput: (e) => runsOverviewModel.setRunsFilter(e.target.value),
}, '');

export default runNumberFilter;
