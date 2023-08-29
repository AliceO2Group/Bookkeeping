import { Observable, RemoteData } from '/js/src/index.js';

class ColumnModel {
    constructor(key, name) {
        this.key = key
    }
    getValue() {}
}

class OverviewModel extends Observable {
    constructor(model) {
        super(model)

        this._columnsModels = {}
    }
}

class PassThroughColumnmodel extends ColumnModel {
    constructor(key) {
        super()
        this.key = key
    }

    getValue(coffeeData) {
        return coffeeData[this.key]
    }
}

class CoffeeScoreColumnModel extends ColumnModel {
    constructor() {
        super()
    }

    getValue({ rating }) {
        return {rating, good: (rating > 2.5)}
    }
}

export class CoffeeModel extends OverviewModel {
    constructor(model) {
        super(model)

        this._coffees = [
            {id: 1, title: 'Intenso', rating: 5, comments: 'Very intense!'},
            {id: 2, title: 'Forte', rating: 4, comments: 'Well rounded and unoffensive'},
            {id: 3, title: 'Decaffeinato', rating: 2, comments: 'It\'s ok'}
        ]

        this._columnsModels = {
            title: new PassThroughColumnmodel('title'),
            coffeeScore: new CoffeeScoreColumnModel(),
            comments: new PassThroughColumnmodel('comments')
        }
    }

    get coffees() {
        return this._coffees
    }

    get columnsModels() {
        return this._columnsModels
    }
}