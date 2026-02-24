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
    get normalizedFilter() {
        const normalized = {};

        if (!this._timeRangeInputModel.fromTimeInputModel.isEmpty) {
            normalized.from = this._timeRangeInputModel.normalizedFilter.from;
        }
        if (!this._timeRangeInputModel.toTimeInputModel.isEmpty) {
            normalized.to = this._timeRangeInputModel.normalizedFilter.to;
        }

        return normalized;
    }

    /**
     * @inheritDoc
     */
    set normalizedFilter({ from, to }) {
        this._timeRangeInputModel.normalizedFilter = { from, to };
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
