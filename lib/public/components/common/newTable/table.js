import spinner from '../spinner.js';
import errorAlert from '../errorAlert.js';
import { noDataRow } from '../activeColumnsTable/noDataRow.js';
import { h, RemoteData } from '/js/src/index.js';

/**
 * Renders a row of the table as vnodes
 * @param {T} data the data corresponding to this row
 * @param {Map<String, TableColumn>} columns A map from a string used as the vnode key for this column,  a TableColumn model
 * @param {(T) => String} getRowKey A function that takes a row of the data and returns a string used for the vnode key of this row.
 * @param {null|(T) => String} getRowClasses Optionally a function that takes a row of the data and returns css classes for this row
 * @param {null|(T) => Object} getRowConfig Optionally a function that takes a row of the data and returns a config object passed to h()
 * @returns {vnode} a vnode corresponding to a row of this table
 */
const tableRow = (row, columns, getRowKey, getRowClasses, getRowConfig) => {
    const rowKey = getRowKey(row);
    const rowClasses = getRowClasses ? getRowClasses(row) : '';
    const rowConfig = getRowConfig ? getRowConfig(row) : {};

    return h(`tr.${rowClasses}`, { key: rowKey, ...rowConfig }, Object.entries(columns).map(([columnKey, column]) => {
        const cellData = column.model.getValue(row);
        const cellKey = `${rowKey}-${columnKey}`;
        return h('td', { key: cellKey }, column.renderer(cellData));
    }));
};

/**
 * Renders the headers of the table.
 * @param {Map<String, TableColumn>} columns A map from a string used as the vnode key for this column,  a TableColumn model
 * @returns {vnode} a table row containing the headers of the table.
 */
const tableHeaders = (columns) => h('thead', h('tr', Object.values(columns).map(({ header }) => h('th', header))));

/**
 * Renders a table body using an Array
 * @param {T[]} data array of data to display or RemoteData of the same type
 * @param {Map<String, TableColumn>} columns A map from a string used as the vnode key for this column,  a TableColumn model
 * @param {(T) => String} getRowKey A function that takes a row of the data and returns a string used for the vnode key of this row.
 * @param {null|(T) => String} getRowClasses Optionally a function that takes a row of the data and returns css classes for this row
 * @param {null|(T) => Object} getRowConfig Optionally a function that takes a row of the data and returns a config object passed to h()
 * @returns {vnode} the vnode corresponding to the body of the table displaying this data
 */
const tableBodyArray =
    (data, columns, getRowKey, getRowClasses, getRowConfig) => data.map((row) => tableRow(row, columns, getRowKey, getRowClasses, getRowConfig));

/**
 * Renders a table body using RemoteData
 * @param {RemoteData<T[]>} remoteData a remote data object for the array of data
 * @param {Map<String, TableColumn>} columns A map from a string used as the vnode key for this column,  a TableColumn model
 * @param {(T) => String} getRowKey A function that takes a row of the data and returns a string used for the vnode key of this row.
 * @param {null|(T) => String} getRowClasses Optionally a function that takes a row of the data and returns css classes for this row
 * @param {null|(T) => Object} getRowConfig Optionally a function that takes a row of the data and returns a config object passed to h()
 * @returns {vnode} the vnode corresponding to the body of the table displaying this data
 */
const tableBodyRemoteData = (remoteData, columns, getRowKey, getRowClasses, getRowConfig) => {
    const columnsCount = Object.keys(columns).length;

    return remoteData.match({
        NotAsked: () => noDataRow(columnsCount),
        Loading: () => h(
            'tr',
            h(
                'td',
                { colSpan: columnsCount },
                spinner({ size: 5, absolute: false }),
            ),
        ),
        Success: (payload) => tableBodyArray(payload, columns, getRowKey, getRowClasses, getRowConfig),
        Failure: (errors) => h('tr', h('td', { colSpan: columnsCount }, errors.map(errorAlert))),
    });
};

/**
 * Renders a table containing data
 * @param {T[]|RemoteData<T[]>} data array of data to display or RemoteData of the same type
 * @param {Map<String, TableColumn>} columns A map from a string used as the vnode key for this column,  a TableColumn model
 * @param {(T) => String} getRowKey A function that takes a row of the data and returns a string used for the vnode key of this row.
 * @param {null|(T) => String} getRowClasses Optionally a function that takes a row of the data and returns css classes for this row
 * @param {null|(T) => Object} getRowConfig Optionally a function that takes a row of the data and returns a config object passed to h()
 * @returns {vnode} the vnode corresponding to the table displaying this data
 */
export const table = (data, columns, getRowKey, getRowClasses = null, getRowConfig = null) => {
    const tableBody = data instanceof RemoteData ? tableBodyRemoteData : tableBodyArray;
    return h('table.table', [
        tableHeaders(columns),
        tableBody(data, columns, getRowKey, getRowClasses, getRowConfig),
    ]);
};
