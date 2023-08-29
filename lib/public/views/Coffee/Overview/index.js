import { table } from "../../../components/common/newTable/table.js";
import { h } from '/js/src/index.js';

const coffeeCellDisplay = {
    title: {
        header: 'Coffee Name', 
        display: (title) => title
    },
    comments: {
        header: 'Comments', 
        display: (comments) => comments
    },
    coffeeScore: {
        header: 'Coffee Score',
        display: (coffeeScore) => h('.flex-row.g1', [
            coffeeScore.rating,
            coffeeScore.good ? h('.badge.white.bg-success', 'Good') : h('.badge.white.bg-danger', 'Bad')
        ])
    }
}

const getCoffeeTableRowKey = (row) => row.id

export const CoffeeOverview = ({coffee: coffeeModel}) => {
    const coffees = coffeeModel.coffees
    const columnModels = coffeeModel.columnsModels
    return table(coffees, columnModels, coffeeCellDisplay, getCoffeeTableRowKey);
}