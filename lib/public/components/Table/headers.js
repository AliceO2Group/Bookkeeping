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
import { iconCaretTop, iconCaretBottom, iconX } from '/js/src/icons.js';

/**
 * Renders the header row
 * @param {Object} keys The full collection of API keys and their corresponding header values
 * @param {Object} model The global model object
 * @return {vnode} An array of rows containing all given header values with specific cell sizes
 */
const headers = (keys, model) => h('thead', h('tr', Object.entries(keys).reduce((accumulator, [key, value]) => {
    if (value.visible) {
        const size = value.size || 'cell-m';
        if (value.sortable) {
            const columnSortingOperation = model.logs.getSortingOperation(key);
            const columnSortingOperationPreview = model.logs.getSortingPreviewOperation(key);
            accumulator.push(h(`th.${size}.clickable`, {
                scope: 'col',
                onclick: () => model.logs.setSortingValues(key),
                onmouseenter: () => model.logs.setSortingPreviewValues(key),
                onmouseleave: () => model.logs.clearSortingPreviewValues(),
            }, h('.flex-row.items-center', [
                h('', value.name),
                h(`.ml2${columnSortingOperationPreview ? '.gray-dark' : ''}`, {
                    asc: iconCaretBottom(), desc: iconCaretTop(), none: iconX(),
                }[columnSortingOperationPreview || columnSortingOperation]),
            ])));
        } else {
            accumulator.push(h(`th.${size}`, { scope: 'col' }, value.name));
        }
    }
    return accumulator;
}, [])));

export default headers;
