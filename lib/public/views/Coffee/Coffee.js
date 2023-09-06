import { Observable } from '/js/src/index.js';

/**
 * @interface
 */
class ColumnModel {
    /**
     * @template T, V
     * @param {T} row 
     * @returns {V} data to be displayed in the column
     */
    getValue(row) {}
}

/**
 * @implements {ColumnModel}
 */
export class PassThroughColumnmodel extends ColumnModel {
    constructor(key) {
        super()
        this.key = key
    }

    getValue(coffeeData) {
        return coffeeData[this.key]
    }
}

/**
 * @implements {ColumnModel}
 */
class CoffeeScoreColumnModel extends ColumnModel {
    constructor() {
        super()
    }

    getValue({ rating }) {
        return {rating, good: (rating > 2.5)}
    }
}

/**
 * @type {TableModel}
 */
class CoffeeTableModel {
    constructor() {
        this._title = new PassThroughColumnmodel('title')
        this._coffeeScore = new CoffeeScoreColumnModel()
        this._comments = new PassThroughColumnmodel('comments')
    }

    /**
     * @returns {ColumnModel}
     */
    get title() {
        return this._title
    }

    /**
     * @returns {ColumnModel}
     */
    get coffeeScore() {
        return this._coffeeScore
    }

    /**
     * @returns {ColumnModel}
     */
    get comments() {
        return this._comments
    }
}

export class CoffeeModel extends Observable {
    constructor(model) {
        super(model)

        this._coffees = [
            {id: 1, title: 'Intenso', rating: 5, comments: 'Very intense!'},
            {id: 2, title: 'Forte', rating: 4, comments: 'Well rounded and unoffensive'},
            {id: 3, title: 'Decaffeinato', rating: 2, comments: 'It\'s ok'}
        ]

        /** @type {TableModel} */
        this._tableModel = new CoffeeTableModel()
    }

    /**
     * @returns {Coffee[]}
     */
    get coffees() {
        return this._coffees
    }

    get tableModel() {
        return this._tableModel
    }
}