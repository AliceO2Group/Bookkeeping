import { h } from '/js/src/index.js';

/**
 * @template T
 * @param {T[]} data array of data to display
 * @param {Map<String, TableColumn>} columns 
 * @param {(T) => String} getRowKey 
 * @returns {vnode}
 */
const tableRow = (row, columns, getRowKey, getRowClasses, getRowConfig) => {
    const rowKey = getRowKey(row)
    const rowClasses = getRowClasses ? getRowClasses(row) : ''
    const rowConfig = getRowConfig ? getRowConfig(row) : {}

    return h(`tr.${rowClasses}`, {key: rowKey, ...rowConfig}, Object.entries(columns).map(([columnKey, column]) => {
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
 * @param {null|(T) => String} getRowClasses
 * @param {null|(T) => Object} getRowConfig
 * @returns {vnode}
 */
export const table = (data, columns, getRowKey, getRowClasses = null, getRowConfig = null) => {
    const tableRows = data.map(row => tableRow(row, columns, getRowKey, getRowClasses, getRowConfig))
    return h('table.table', [
        h('thead', h('tr', Object.values(columns).map(({header}) => h('th', header)))),
        h('tbody', ...tableRows)
    ])
}