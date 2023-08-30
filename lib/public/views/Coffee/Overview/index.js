import { table } from "../../../components/common/newTable/table.js";
import { h } from '/js/src/index.js';

/**
 * @type {CellRenderers}
 */
const coffeeTableRenderers = {
    title: (title) => title,
    comments: (comments) => comments,
    coffeeScore: (coffeeScore) => h('.flex-row.g1', [
            coffeeScore.rating,
            coffeeScore.good ? h('.badge.white.bg-success', 'Good') : h('.badge.white.bg-danger', 'Bad')
        ])
}

const getCoffeeTableRowKey = (row) => row.id

export const CoffeeOverview = ({coffee: coffeeModel}) => {
    const coffees = coffeeModel.coffees
    const tableModel = coffeeModel.tableModel
    
    return table(coffees, {
        title: {header: 'Coffee Name', model: tableModel.title, renderer: coffeeTableRenderers.title},
        comments: {header: 'Comments', model: tableModel.comments, renderer: coffeeTableRenderers.comments},
        coffeeScore: {header: 'Score', model: tableModel.coffeeScore, renderer: coffeeTableRenderers.coffeeScore},
    }, getCoffeeTableRowKey);
}