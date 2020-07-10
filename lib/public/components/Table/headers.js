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
 * Renders the header row
 * @param {Object} keys The full collection of API keys and their corresponding header values
 * @return {vnode} An array of rows containing all given header values with specific cell sizes
 */
const headers = (keys) => h('thead', h('tr', Object.values(keys).reduce((accumulator, value) => {
    if (value.visible) {
        const size = value.size || 'cell-m';
        accumulator.push(h(`th.${size}`, { scope: 'col' }, value.name));
    }
    return accumulator;
}, [])));

export default headers;
