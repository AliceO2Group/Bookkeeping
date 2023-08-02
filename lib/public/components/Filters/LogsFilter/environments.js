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
 * Returns a filter component to filter on environment Ids, either a coma separated list of specific ids or a substring
 * search
 * @param {RunModel} logModel The global model object
 * @return {vnode} A text box that allows the user to enter an environment substring to match against all runs or a
 *     list of environment ids
 */
const environmentFilter = (logModel) => h('input.w-75.mt1', {
    type: 'text',
    id: 'environments',
    value: logModel.getEnvFilterRaw(),
    placeholder: 'e.g. Dxi029djX, TDI59So3d...',
    oninput: (e) => logModel.setEnvFilter(e.target.value),
}, '');

export default environmentFilter;
