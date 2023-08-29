import { h } from '/js/src/index.js';

const tableRow = (row, columnModels, cellDisplay, getRowKey) => {
    const rowKey = getRowKey(row)

    return h('tr', {key: rowKey}, Object.keys(cellDisplay).map((columnKey) => {
        const display = cellDisplay[columnKey].display
        const cellData = columnModels[columnKey].getValue(row)
        return h('td', {key: `${rowKey}-${columnKey}`}, display(cellData))
    }))
}

export const table = (data, columnModels, cellDisplay, getRowKey) => {
    const tableRows = data.map(row => tableRow(row, columnModels, cellDisplay, getRowKey))
    return h('table', [
        h('tr', Object.values(cellDisplay).map(({header}) => h('td', header))),
        ...tableRows
    ])
}