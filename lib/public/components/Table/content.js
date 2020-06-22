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
 * Renders a single row with content
 * @param {Object} value The key value potentially containing a formatter function
 * @param {String} text The content text
 * @return {vnode} A single table cell containing (formatted) text
 */
const row = (value, text) => {
    const formatted = value && value.format ? value.format(text) : text;
    return h('td#', formatted);
};

/**
 * Renders a list of rows with content
 * @param {Array} data The full collection of API data corresponding to the keys
 * @param {Object} keys The full collection of API keys and their corresponding header values
 * @param {Function} params Additional element parameters, wrapped in a function
 * @return {vnode} A filled array of rows based on the given data and keys
 */
const content = (data, keys, params) => {
    const idKey = Object.keys(keys).find((key) => keys[key] && keys[key].primary);
    return h('tbody', data.map((entry) =>
        h(`tr#row${entry[idKey]}`, params(entry), Object.entries(keys).map(([key, value]) => row(value, entry[key])))));
};

export default content;
