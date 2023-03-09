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
import { overflowBalloon } from '../popover/overflowBalloon.js';
import { noDataRow } from './noDataRow.js';

/**
 * Renders a single cell with content
 * @param {String} rowId The unique identifier of the row containing the cell
 * @param {Column} column the column definition containing the cell to display
 * @param {Object} rowData the data of the full row, potentially used by cell content's formatter
 * @return {vnode} A single table cell containing (formatted) text
 */
const cell = (rowId, column, rowData) => {
    const cellData = rowData[column.key];
    const { key, title: isTitle, balloon = false, noEllipsis = false } = column;
    const format = column.format || ((text) => text);

    const cellContent = format(cellData, rowData);

    // Flag defining if the text must have a popover displayed at hover containing the full text
    const isBalloon = typeof balloon === 'function' ? balloon(cellData) : Boolean(balloon);

    const columnId = `${rowId}-${key}`;
    const allParams = {
        id: `${columnId}-text`,
    };
    if (isTitle) {
        allParams.title = cellContent;
    }

    // Keep value.size for retro-compatibility purpose
    return h(`td.${column.size} ${column.classes}`, {
        id: columnId,
        key: columnId,
    }, isBalloon ? overflowBalloon(cellContent, { stretch: true }) : h(`${noEllipsis ? '' : '.w-wrapped'}`, allParams, cellContent));
};

/**
 * @typedef RowsConfiguration
 * @property {function(Array):Object} [callback] a callback called on each row's data, and whose result will be added to the row component's
 *     attributes
 * @property {string} [classes] the css classes to apply to each row (separated by a dot)
 */

/**
 * Renders a list of rows with content
 *
 * @param {Object[]} data the data to display. Each item property must match the key in columns list if the property
 *     must be displayed as this column's value
 * @param {string} idKey the key of the column from which row identifier must be extracted
 * @param {Column[]} columns the list of columns to display
 * @param {RowsConfiguration|null} [configuration] the rows configuration
 * @return {vnode} A filled array of rows based on the given data and keys
 */
export const rows = (data, idKey, columns, configuration) => {
    const { callback: rowConfigurationCallback, classes: rowClasses } = configuration || {};

    let body;
    if (!data || data.length === 0) {
        body = noDataRow(columns.length);
    } else {
        body = data.map((rowData) => {
            const rowId = `row${rowData[idKey]}`;
            return h(`tr#${rowId}.${rowClasses}`, {
                key: rowId,
                ...rowConfigurationCallback && rowConfigurationCallback(rowData),
            }, columns.map((column) => cell(rowId, column, rowData)));
        });
    }

    return h('tbody', body);
};
