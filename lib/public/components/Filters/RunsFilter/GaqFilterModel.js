import { FilterModel } from '../common/FilterModel.js';
import { NumericalComparisonFilterModel } from '../common/filters/NumericalComparisonFilterModel.js';

/**
 * Time-range filter model
 */
export class GaqFilterModel extends FilterModel {
    /**
     * Constructor
     * @param {ToggleFilterModel} mcReproducibleAsNotBad model that determines if a 'not bad' status was reproduceable for a Monte Carlo.
     * This param is required as many other filters models need to make use of the same ToggleFilterModel instance
     */
    constructor(mcReproducibleAsNotBad) {
        super();

        this._notBadFraction = new NumericalComparisonFilterModel({ scale: 0.01, integer: false });
        this._addSubmodel(this._notBadFraction);
        this._mcReproducibleAsNotBad = mcReproducibleAsNotBad;
        this._addSubmodel(this._mcReproducibleAsNotBad);
    }

    /**
     * @inheritDoc
     */
    reset() {
        this._notBadFraction.reset();
    }

    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._notBadFraction.isEmpty;
    }

    /**
     * @inheritDoc
     */
    get normalized() {
        const normalized = { notBadFraction: this._notBadFraction.normalized };

        if (!this.isEmpty) {
            normalized.mcReproducibleAsNotBad = this._mcReproducibleAsNotBad.isToggled();
        }

        return normalized;
    }

    /**
     * Return the underlying notBadFraction model
     *
     * @return {NumericalComparisonFilterModel} the filter model
     */
    get notBadFraction() {
        return this._notBadFraction;
    }

    /**
     * Return the underlying mcReproducibleAsNotBad model
     *
     * @return {ToggleFilterModel} the filter model
     */
    get mcReproducibleAsNotBad() {
        return this._mcReproducibleAsNotBad;
    }
}
