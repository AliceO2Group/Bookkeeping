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

    /**
     * @inheritDoc
     */
    reset() {
        this._timeRangeInputModel.reset();
    }

    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._timeRangeInputModel.isEmpty;
    }

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

    /**
     * Return the underlying time range input model
     *
     * @return {TimeRangeInputModel} the input model
     */
    get timeRangeInputModel() {
        return this._timeRangeInputModel;
    }
}
