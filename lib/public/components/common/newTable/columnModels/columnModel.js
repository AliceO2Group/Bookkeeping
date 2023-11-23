/**
 * @interface
 */
export class ColumnModel {
    /**
     * @template T, V
     * @param {T} row 
     * @returns {V} data to be displayed in the column
     */
    getValue(row) {}
}
