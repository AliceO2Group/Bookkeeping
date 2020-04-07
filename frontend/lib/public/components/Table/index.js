/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { h } from '/js/src/index.js';

/**
 * Table row header
 * @param {String} header The text of the header elements
 * @return {vnode} Return a single row header element
 */
const rowHeader = (header) => [h('th', header)];

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
 * @returns {vnode} Return the total view of the table to rendered
 */
const table = (data, headers) => h('table.table.shadow-level1.mh3', [
    h('tr', [headers.map((header) => rowHeader(header))]),
    data.map((entry, index) => h('tr', [
        rowData(index + 1),
        Object.keys(entry).map((subItem) => rowData(entry[subItem])),
    ])),
]);

export { table };
