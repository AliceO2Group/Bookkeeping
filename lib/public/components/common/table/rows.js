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
import { wrapWithBalloon } from '../../../utilities/wrapWithBalloon.js';

/**
 * Renders a single cell with content
 * @param {String} key The internal identifier for the column
 * @param {Object} value The column properties potentially containing a formatter function
 * @param {String} text The content text
 * @param {String} rowId The current rowId
 * @param {Object} entry The specific object
 * @return {Vnode} A single table cell containing (formatted) text
 */
const cell = (key, value, text, rowId, entry) => {
    value = {
        format: (text) => text,
        balloon: false,
        ...value,
    };

    const formattedText = value.format(text, entry);

    // Flag defining if the text must have a popover displayed at hover containing the full text
    const isBalloon = typeof value.balloon === 'function' ? value.balloon(text) : Boolean(value.balloon);

    const columnId = `${rowId}-${key}`;
    const allParams = value.title ? { title: formattedText } : {};
    allParams['id'] = `${columnId}-text`;

    // Keep value.size for retro-compatibility purpose
    return h(`td.${value.size} ${value.classes}`, {
        id: columnId,
        key: columnId,
    }, isBalloon ? wrapWithBalloon(formattedText) : h('.w-wrapped', allParams, formattedText));
};

/**
 * Renders a list of rows with content
 *
 * @template T
 *
 * @param {array} data The full collection of API data corresponding to the keys
 * @param {Object} columnsDescriptions The full collection of API keys and their corresponding header values
 * @param {function} rowConfigurationCallback Additional element parameters, wrapped in a function to which row data entry will be provided
 * @param {string} row string
 * @return {vnode} A filled array of rows based on the given data and keys
 */
export const rows = (data, columnsDescriptions, rowConfigurationCallback, row = '') => {
    const idKey = Object.keys(columnsDescriptions).find((key) => columnsDescriptions[key] && columnsDescriptions[key].primary);

    return h('tbody', data.map((entry) => {
        const rowId = `row${entry[idKey]}`;
        return h(`tr#${rowId}.${row}`, {
            key: rowId,
            ...rowConfigurationCallback && rowConfigurationCallback(entry),
        }, Object.entries(columnsDescriptions).reduce((accumulator, [key, value]) => {
            if (value.visible) {
                accumulator.push(cell(key, value, entry[key], rowId, entry));
            }
            return accumulator;
        }, []));
    }));
};
