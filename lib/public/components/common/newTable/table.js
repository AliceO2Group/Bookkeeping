import { h } from '/js/src/index.js';

const tableRow = (row, columnModels, cellDisplay) => {
    return h('tr', {key: `${row.id}`}, Object.keys(cellDisplay).map((key) => {
        const display = cellDisplay[key].display
        const cellData = columnModels[key].getValue(row)
        return h('td', {key: `${row.id}-${key}`}, display(cellData))
    }))
}

export const table = (data, columnModels, cellDisplay) => {
    const tableRows = data.map(row => tableRow(row, columnModels, cellDisplay))
    return h('table', [
        h('tr', Object.values(cellDisplay).map(({header}) => h('td', header))),
        ...tableRows
    ])
}