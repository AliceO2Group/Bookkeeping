/**
 * Inteface for column models. They should have a method that takes
 * a row of the table, and returns the data to be displayed in this column
 *
 * @interface ColumnModel
 */

/**
 * Gets the data to display for this column based on a row value
 *
 * @template T, V
 *
 * @method
 * @name ColumnModel#getValue
 * @param {T} row the data element being displayed in this row
 * @returns {V} the data corresponding to the value of the row in this column
 */
