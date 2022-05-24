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
 * Renders a single cell with content
 * @param {String} key The internal identifier for the column
 * @param {Object} value The column properties potentially containing a formatter function
 * @param {String} text The content text
 * @param {String} rowId The current rowId
 * @param {Object} model The global model object
 * @param {Object} entry The specific object
 * @return {vnode} A single table cell containing (formatted) text
 */
const content = (key, value, text, rowId, model, entry) => {
    const formattedText = value && value.format ? value.format(text, entry) : text;

    const columnId = `${rowId}-${key}`;
    const canExpand = model.logs.canColumnExpand(rowId, value.name);
    const allParams = value.title ? { title: formattedText } : {};
    allParams['id'] = `${columnId}-text`;

    // Keep value.size for retro-compatibility purpose
    return h(`td.${value.size} ${value.classes}`, {
        id: columnId,
        onupdate: () => {
            // TODO still needed?: 1.25 margin is added to catch minor height miscalculations
            if (value.expand) {
                const element = model.document.getElementById(`${columnId}-text`);
                const minimalHeight = model.logs.getMinimalColumnHeight(rowId, value.name);
                const shouldCollapse =
                    element.scrollHeight >= minimalHeight * 1.25 || element.scrollHeight >= element.offsetHeight * 1.25;
                const shouldNotCollapse = element.scrollHeight <= minimalHeight * 1.25;
                if (!canExpand && shouldCollapse) {
                    model.logs.addCollapsableColumn(rowId, value.name, element.offsetHeight);
                } else if (canExpand && shouldNotCollapse) {
                    model.logs.disableCollapsableColumn(rowId, value.name);
                }
            }
        },
        onclick: canExpand ? (e) => e.stopPropagation() : null,
    }, h('.w-wrapped', allParams, formattedText));
};

/**
 * Renders a list of rows with content
 * @param {Array} data The full collection of API data corresponding to the keys
 * @param {Object} keys The full collection of API keys and their corresponding header values
 * @param {Object} model The global model object
 * @param {Function} params Additional element parameters, wrapped in a function
 * @param {String} cssClass string
 * @return {vnode} A filled array of rows based on the given data and keys
 */
const rows = (data, keys, model, params, cssClass = '') => {
    const idKey = Object.keys(keys).find((key) => keys[key] && keys[key].primary);

    return h('tbody', data.map((entry) => {
        const rowId = `row${entry[idKey]}`;
        return h(`tr#${rowId}.${cssClass}`, params(entry), Object.entries(keys).reduce((accumulator,
            [key, value]) => {
            if (value.visible) {
                accumulator.push(content(key, value, entry[key], rowId, model, entry));
            }
            return accumulator;
        }, []));
    }));
};

export default rows;
