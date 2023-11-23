import { ColumnModel } from './columnModel.js'

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
