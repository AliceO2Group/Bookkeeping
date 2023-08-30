import { h } from '/js/src/index.js';

/**
 * @template T
 * @param {T[]} data array of data to display
 * @param {Map<String, TableColumn>} columns 
 * @param {(T) => String} getRowKey 
 * @returns {vnode}
 */
const tableRow = (row, columns, getRowKey) => {
    const rowKey = getRowKey(row)

    return h('tr', {key: rowKey}, Object.entries(columns).map(([columnKey, column]) => {
        console.log(columnKey, column)
        const cellData = column.model.getValue(row)
        const cellKey = `${rowKey}-${columnKey}`
        return h('td', {key: cellKey}, column.renderer(cellData))
    }))
}

/**
 * @template T
 * @param {T[]} data array of data to display
 * @param {Map<String, TableColumn>} columns 
 * @param {(T) => String} getRowKey 
 * @returns {vnode}
 */
export const table = (data, columns, getRowKey) => {
    const tableRows = data.map(row => tableRow(row, columns, getRowKey))
    return h('table', [
        h('tr', Object.values(columns).map(({header}) => h('td', header))),
        ...tableRows
    ])
}