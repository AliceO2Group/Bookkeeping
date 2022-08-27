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

import { h, RemoteData } from '/js/src/index.js';
import { headers } from './headers.js';
import { rows } from './rows.js';
import spinner from '../spinner.js';
import errorAlert from '../errorAlert.js';

/**
 * @callback rowConfigurationCallback
 * @template T
 *
 * @param {T} [entry] optionally the current row data
 *
 * @return {object} the configuration to apply on the row
 */

/**
 * Renders the table
 *
 * @param {array|RemoteData} data An object array, with every object representing a to be rendered row
 * @param {object} columnsDescriptions The full collection of API keys and their corresponding header values
 * @param {object} models the list of table models, storing optionally sort model and filter model
 * @param {rowConfigurationCallback|null} rowConfigurationCallback Additional element parameters, wrapped in a function
 * @param {string} rowClasses the css classes to apply to each row (separated by a dot)
 * @returns {vnode} Return the total view of the table to rendered
 */
export const table = (
    data,
    columnsDescriptions,
    { sortModel = null, filterModel = null } = {},
    rowConfigurationCallback = null,
    rowClasses = '',
) => {
    let content = data;
    if (Array.isArray(data)) {
        content = RemoteData.success(data);
    }

    const columnsCount = Object.values(columnsDescriptions)
        .filter((columnDescription) => columnDescription.visible).length;

    return h(
        'table.table.table-hover.shadow-level1.no-z-index',
        {
            style: 'table-layout: fixed',
        },
        [
            headers(columnsDescriptions, sortModel, filterModel),
            content.match({
                NotAsked: () => null,
                Loading: () => h(
                    'tr',
                    h(
                        'td',
                        { colSpan: columnsCount },
                        spinner({ size: 5, absolute: false }),
                    ),
                ),
                Success: (payload) => rows(payload, columnsDescriptions, rowConfigurationCallback, rowClasses),
                Failure: (errors) => h('tr', h('td', { colSpan: columnsCount }, errors.map(errorAlert))),
            }),
        ],
    );
};
