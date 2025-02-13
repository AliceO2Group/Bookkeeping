import { FilterModel } from '../FilterModel.js';

const EMPTY_VALUE = '';

/**
 * Filtering model to handle raw text value
 */
export class RawTextFilterModel extends FilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._value = EMPTY_VALUE;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        this._value = EMPTY_VALUE;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._value === EMPTY_VALUE;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get normalized() {
        return this._value;
    }

    /**
     * Return the filter current value
     *
     * @return {string} the current value
     */
    get value() {
        return this._value;
    }

    /**
     * Sets the filter current value
     *
     * @param {string} value the current value
     */
    set value(value) {
        this._value = value;
        this.notify();
    }
}
