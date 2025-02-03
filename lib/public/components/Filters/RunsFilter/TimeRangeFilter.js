import { FilterModel } from '../common/FilterModel.js';
import { TimeRangeInputModel } from '../common/filters/TimeRangeInputModel.js';

/**
 * Time-range filter model
 */
export class TimeRangeFilterModel extends FilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._timeRangeInputModel = new TimeRangeInputModel();
        this._addSubmodel(this._timeRangeInputModel);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        this._timeRangeInputModel.reset();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._timeRangeInputModel.isEmpty;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get normalized() {
        const normalized = {};

        if (!this._timeRangeInputModel.fromTimeInputModel.isEmpty) {
            normalized.from = this._timeRangeInputModel.normalized.from;
        }
        if (!this._timeRangeInputModel.toTimeInputModel.isEmpty) {
            normalized.to = this._timeRangeInputModel.normalized.to;
        }

        return normalized;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    hydrate(normalizedValue) {
        const { from, to } = normalizedValue;
        if (from) {
            this._timeRangeInputModel.fromTimeInputModel.setValue(parseInt(from, 10));
        }
        if (to) {
            this._timeRangeInputModel.toTimeInputModel.setValue(parseInt(to, 10));
        }
        return Promise.resolve();
    }

    /**
     * Return the underlying time range input model
     *
     * @return {TimeRangeInputModel} the input model
     */
    get timeRangeInputModel() {
        return this._timeRangeInputModel;
    }
}
