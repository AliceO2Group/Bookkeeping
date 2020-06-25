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

import { h, iconPlus, iconMinus } from '/js/src/index.js';

/**
 * Renders a single row with content
 * @param {Object} value The key value potentially containing a formatter function
 * @param {String} text The content text
 * @param {String} rowId The current rowId
 * @param {Object} model The global model object
 * @return {vnode} A single table cell containing (formatted) text
 */
const row = (value, text, rowId, model) => {
    const formattedText = value && value.format ? value.format(text) : text;

    const columnId = `${rowId}-${value.name.toLowerCase()}`;
    const canExpand = model.logs.canColumnExpand(rowId, value.name);
    const isExpanded = model.logs.isColumnExpanded(rowId, value.name);
    const base = `.${value.size}#${columnId}`;

    return h(`td${base}`, {
        onupdate: () => {
            if (value.expand) {
                const element = model.document.getElementById(`${columnId}-text`);
                const minimalHeight = model.logs.getMinimalColumnHeight(rowId, value.name);
                const shouldCollapse = element.scrollHeight > minimalHeight ||
                    element.scrollHeight > element.offsetHeight;
                if (!canExpand && shouldCollapse) {
                    model.logs.addCollapsableColumn(rowId, value.name, element.offsetHeight);
                } else if (canExpand && element.scrollHeight <= minimalHeight) {
                    model.logs.disableCollapsableColumn(rowId, value.name);
                }
            }
        },
        onclick: canExpand ? (e) => e.stopPropagation() : null,
    }, [
        h('.flex-row.items-center', [
            h(`div#${columnId}-text.overflow${isExpanded ? '.show-overflow' : ''}`, formattedText),
            value.expand && canExpand &&
                h(`#${columnId}-${!isExpanded ? 'plus' : 'minus'}.${isExpanded ? 'danger' : 'primary'}`, {
                    onclick: (e) => {
                        e.stopPropagation();
                        model.logs.toggleCollapse(rowId, value.name);
                    },
                }, isExpanded
                    ? h('.collapse-button', iconMinus())
                    : h('.flex-row', [h('.black', '...'), h('.collapse-button', iconPlus())])),
        ]),
    ]);
};

/**
 * Renders a list of rows with content
 * @param {Array} data The full collection of API data corresponding to the keys
 * @param {Object} keys The full collection of API keys and their corresponding header values
 * @param {Function} params Additional element parameters, wrapped in a function
 * @param {Object} model The global model object
 * @return {vnode} A filled array of rows based on the given data and keys
 */
const content = (data, keys, params, model) => {
    const idKey = Object.keys(keys).find((key) => keys[key] && keys[key].primary);

    return h('tbody', data.map((entry) => {
        const rowId = `row${entry[idKey]}`;
        return h(`tr#${rowId}`, params(entry), Object.entries(keys)
            .map(([key, value]) => row(value, entry[key], rowId, model)));
    }));
};

export default content;
