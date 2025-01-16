import { FilterModel } from '../common/FilterModel.js';
import { NumericalComparisonFilterModel } from '../common/filters/NumericalComparisonFilterModel.js';

export class GaqFilterModel extends FilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._notBadFractionFilterModel = new NumericalComparisonFilterModel({
            useOperatorAsNormalizationKey: true,
            scale: 0.01,
            integer: true,
        });
        this._addSubmodel(this._notBadFractionFilterModel);

        this._mcReproducibleAsNotBad = false;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._notBadFractionFilterModel.isEmpty;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get normalized() {
        return {
            notBadFraction: this._notBadFractionFilterModel.normalized,
            mcReproducibleAsNotBad: this._mcReproducibleAsNotBad,
        };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        this._notBadFractionFilterModel.reset();
        // Do not reset mc reproducible as not bad, which is a parameter independent of filter
    }

    /**
     * Return the not bad fraction filter submodel
     *
     * @return {NumericalComparisonFilterModel} the filter submodel
     */
    get notBadFractionFilterModel() {
        return this._notBadFractionFilterModel;
    }

    /**
     * Defines if MC reproducible is to be considered as not bad
     *
     * @param {boolean} value true if MC reproducible is to be considered as not bad
     * @return {void}
     */
    setMcReproducibleAsNotBad(value) {
        this._mcReproducibleAsNotBad = value;
    }
}