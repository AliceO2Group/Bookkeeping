import { h } from '/js/src/index.js';

/**
 * Renders a row of the table as vnodes
 * @param {T[]} data array of data to display
 * @param {Map<String, TableColumn>} columns A map from a string used as the vnode key for this column, and a TableColumn model
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
 * Renders a table containing the data
 * @param {T[]} data array of data to display
 * @param {Map<String, TableColumn>} columns A map from a string used as the vnode key for this column, and a TableColumn model
 * @param {(T) => String} getRowKey A function that takes a row of the data and returns a string used for the vnode key of this row.
 * @param {null|(T) => String} getRowClasses Optionally a function that takes a row of the data and returns css classes for this row
 * @param {null|(T) => Object} getRowConfig Optionally a function that takes a row of the data and returns a config object passed to h()
 * @returns {vnode} the vnode corresponding to the table displaying this data
 */
export const table = (data, columns, getRowKey, getRowClasses = null, getRowConfig = null) => {
    const tableRows = data.map((row) => tableRow(row, columns, getRowKey, getRowClasses, getRowConfig));
    return h('table.table', [
        h('thead', h('tr', Object.values(columns).map(({ header }) => h('th', header)))),
        h('tbody', ...tableRows),
    ]);
};
