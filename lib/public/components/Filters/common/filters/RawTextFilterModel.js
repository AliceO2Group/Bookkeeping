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

    /**
     * @inheritDoc
     */
    reset() {
        this._value = EMPTY_VALUE;
    }

    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._value === EMPTY_VALUE;
    }

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
     * Set the new text value
     *
     * @param {string} value the new value
     * @param {boolean} [notify=false] if true, observers will be notified
     * @return {void}
     */
    update(value, notify) {
        this._value = value;
        if (notify) {
            this.notify();
        }
    }
}
