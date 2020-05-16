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
 * Table row header
 * @param {String} header The text of the header elements
 * @return {vnode} Return a single row header element
 */
const rowHeader = (header) => [h('th', { scope: 'col' }, header)];

/**
 * Table data row
 * @param {Object} data The data to be rendered in the child element of the row
 * @return {vnode} Return a row of data in the table
 */
const rowData = (data) => [h('td', data)];

/**
 * Renders the table
 * @param {Array} data The data array containing the objects with the data per row
 * @param {Array} headers The array of of the headers to be rendered in the table
 * @param {Object} model Model passed for use with routing to the correct detail view
 * @returns {vnode} Return the total view of the table to rendered
 */
const table = (data, headers, model) => h('table.table.shadow-level1.mh3', [
    h('thead', [h('tr', [headers.map((header) => rowHeader(header))])]),
    h('tbody', [
        data.map((entry, index) => h(`tr#row${index + 1}`, {
            style: 'cursor: pointer;',
            onclick: () => model.router.go(`?page=entry&id=${entry[0]}`),
        }, [Object.keys(entry).map((subItem) => rowData(entry[subItem]))])),
    ]),

]);

export { table };
