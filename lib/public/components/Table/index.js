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
import headers from './headers.js';
import content from './content.js';

/**
 * Selectively removes the API keys based on their visibility value
 * @param {Object} keys The full collection of API keys and their corresponding header values
 * @returns {Object} A filtered collection of keys based on visibility
 */
const filterKeysByVisibility = (keys) => {
    Object.entries(keys).forEach(([key, value]) => {
        if (!value.visible) {
            delete keys[key];
        }
    });
};

/**
 * Renders the table
 * @param {Array} data An object array, with every object representing a to be rendered row
 * @param {Object} keys The full collection of API keys and their corresponding header values
 * @param {Function} params Additional element parameters, wrapped in a function
 * @returns {vnode} Return the total view of the table to rendered
 */
const table = (data, keys, params = () => null) => {
    filterKeysByVisibility(keys);
    return h('table.table.table-hover.shadow-level1', { style: { 'margin-bottom': 0 } }, [
        headers(keys),
        content(data, keys, params),
    ]);
};

export default table;
