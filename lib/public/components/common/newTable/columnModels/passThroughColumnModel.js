/**
 * A column that does not modify whatever value is in row[key]
 *
 * @class
 * @implements {ColumnModel}
 */
export class PassThroughColumnmodel {
    /**
     * Constructor
     * @param {string} key the key of the value in the row to access
     */
    constructor(key) {
        this.key = key;
    }

    /**
     * Gets the value of the row in this column, without modifying it.
     * @param {T} row the row of the data to access
     * @returns {V} the value of the row in this column
     */
    getValue(row) {
        return row[this.key];
    }
}
