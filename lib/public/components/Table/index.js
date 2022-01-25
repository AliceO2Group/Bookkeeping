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
import rows from './rows.js';

/**
 * Renders the table
 * @param {Array} data An object array, with every object representing a to be rendered row
 * @param {Object} keys The full collection of API keys and their corresponding header values
 * @param {Object} model The global model object
 * @param {Function} params Additional element parameters, wrapped in a function
 * @param {String} cssClass string
 * @returns {vnode} Return the total view of the table to rendered
 */
const table = (data, keys, model, params = () => null, cssClass) => h('table.table.table-hover.shadow-level1', {
    style: 'table-layout: fixed',
}, [
    headers(keys, model),
    rows(data, keys, model, params, cssClass),
]);

export default table;
