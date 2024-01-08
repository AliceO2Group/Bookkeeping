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
import { profiles } from './profiles.js';
import { applyProfile } from '../../../utilities/applyProfile.js';
import { remoteDataTableBody } from './remoteDataTableBody.js';

/**
 * @typedef Column description of a table column
 * @property {string} key the key under which the column data is stored in the data array
 * @property {Object} name the text displayed as column header
 * @property {Array|string|Object} [profiles] the list of profiles (or the single profile) to which the column is
 *     restricted to. If this is an object, the object's properties define configuration override (property's value)
 *     under specific profiles (property's key)
 * @property {string|Object} [information] extra information given to the header of the column
 * @property {boolean} [visible] false to hide the column
 * @property {string|Symbol|Array|Object} [profiles] may be one of the following (note that if the table has no explicit profile, it will be
 *     assigned {@see profiles.none} profile automatically):
 *     - If this is a string or a symbol, the column will be displayed only if the table's profile is the specified profile
 *     - If this is an array, the column will be displayed only if the table's profile is one of the specified profiles
 *     - If this is an Object:
 *         - If the table do not have explicit profile, this property is ignored
 *         - If the table do have an explicit profile which is not one of this object's properties, the column is not displayed
 *         - If the table do have an explicit profile and it correspond to one of this object's properties, we consider this property:
 *             - If it is an object, this object's properties overrides the column's properties
 *             - Else, if this property is truthy, the column is displayed as is
 * @property {boolean} [primary] true to define the column whose values will be used as row identifier
 * @property {boolean} [noEllipsis] if true, overflowing data will not be displayed as ellipsis but will be visible or wrapped
 * @property {boolean|function} [balloon] true to display a popover if the cell's content overflow, or use a function that will be used to
 *     extract the popover text from the cell's data
 * @property {Object} [size] alias for classes, **deprecated**
 * @property {Object} [classes] css classes to apply on each row (head and body)
 * @property {function(*, Object)|null} [format] function to apply on cell's data to obtain cell's content (the function
 *     can optionally take the full row's content as second parameter). As a default, display data as is
 * @property {Object} [inlineFilter] configuration of the inline filter to apply on the column
 * @property {Object} [sortable]
 */

/**
 * @typedef ParsedColumnsConfiguration
 * @property {string} idKey the key of the column value that may be used as unique row identifier
 * @property {Column[]} displayedColumns list of columns to display (normalized)
 */

/**
 * Parse the given columns configuration to get specific information used to display headers and rows
 *
 * @param {Column[]} columns the entries of the columns list
 * @param {string|Symbol|null} currentProfile the profile in which the table must be displayed
 * @return {ParsedColumnsConfiguration} the parsed configuration
 */
const parseColumnsConfiguration = (columns, currentProfile) => {
    const displayedColumns = [];
    // As a default, the id column is the first one
    let [{ key: idKey }] = columns;
    for (const column of columns) {
        const { key, primary, visible } = column;
        if (primary) {
            idKey = key;
        }

        if (!visible) {
            continue;
        }

        let { profiles: columnProfiles = [profiles.none] } = column;

        if (typeof columnProfiles === 'string') {
            columnProfiles = [columnProfiles];
        }

        const columnUnderProfile = applyProfile(column, currentProfile, columnProfiles);
        if (columnUnderProfile) {
            displayedColumns.push(columnUnderProfile);
        }
    }
    return { idKey, displayedColumns };
};

/**
 * Renders the table
 *
 * @param {array|RemoteData} data the array data to be displayed in the table, eventually wrapped in a
 *     RemoteData
 * @param {Object|Array} columnsConfiguration the list of columns and the corresponding configuration. The property's
 *     name
 * @param {RowsConfiguration|null} [rowsConfiguration] the configuration of the table rows
 * @param {Object|null} [tableConfiguration] the global table configuration
 * @param {string} [tableConfiguration.profile] the profile to apply to the table, to filter out columns or apply
 *     specific configuration. If not specified, any visible column will be displayed
 * @param {TableModels|null} [models] the models that handle the table state
 * @returns {vnode} Return the total view of the table to rendered
 */
export const table = (
    data,
    columnsConfiguration,
    rowsConfiguration = null,
    tableConfiguration = null,
    models = null,
) => {
    // If columns are in the format of an object indexed by the data key, reformat them as an array of normalized config
    let columns;
    if (!Array.isArray(columnsConfiguration)) {
        columns = Object.entries(columnsConfiguration).map(([key, value]) => ({
            ...value,
            key,
        }));
    } else {
        columns = columnsConfiguration;
    }

    if (columns.length === 0) {
        throw new Error('A table must contain at least one column');
    }

    // Extract the profile of the table
    const { profile: currentProfile = profiles.none } = tableConfiguration || {};
    const { idKey, displayedColumns } = parseColumnsConfiguration(columns, currentProfile);

    let remoteData;
    if (Array.isArray(data)) {
        remoteData = RemoteData.success(data);
    } else if (data instanceof RemoteData) {
        remoteData = data;
    } else {
        Error(`Unhandled type <${typeof data}> of data : ${data ? JSON.stringify(data) : data}`);
    }

    return h(
        'table.table.table-hover.shadow-level1.no-z-index',
        {
            style: 'table-layout: fixed',
        },
        [
            headers(displayedColumns, models),
            remoteDataTableBody(remoteData, (payload) => rows(payload, idKey, displayedColumns, rowsConfiguration), columnsConfiguration.length),
        ],
    );
};
