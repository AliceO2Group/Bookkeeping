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

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    hydrate(value) {
        this._value = value;
        return Promise.resolve();
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
