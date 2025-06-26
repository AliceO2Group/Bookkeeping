/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */
import { ComparisonSelectionModel } from './ComparisonSelectionModel.js';
import { FilterModel } from '../FilterModel.js';
import { ProcessedTextInputModel } from './ProcessedTextInputModel.js';

/**
 * NumericalComparisonFilterModel
 */
export class NumericalComparisonFilterModel extends FilterModel {
    /**
     * Constructor
     * @param {object} [options] options of the filter
     * @param {number} [options.scale] scale applied on the value of the operand in normalization
     * @param {boolean} [options.integer=false] if true, value is parsed as integer (else, it will be parsed as float)
     */
    constructor(options) {
        super();
        const { scale = 1, integer = false } = options || {};

        this._operatorSelectionModel = new ComparisonSelectionModel();
        this._operatorSelectionModel.visualChange$.bubbleTo(this._visualChange$);

        this._operandInputModel = new ProcessedTextInputModel({
            parse: (raw) => {
                // Empty the filter
                if (raw === '') {
                    return null;
                }

                const number = integer ? parseInt(raw, 10) : parseFloat(raw);
                if (isNaN(number)) {
                    throw new Error('Expected a number');
                }
                return number * scale;
            },
        });
        this._operandInputModel.visualChange$.bubbleTo(this._visualChange$);
        this._operandInputModel.bubbleTo(this);

        this._operatorSelectionModel.observe(() => this._operandInputModel.raw ? this.notify() : this._visualChange$.notify());
    }

    /**
     * Return raw text filter model
     *
     * @return {ProcessedTextInputModel} operand input model
     */
    get operandInputModel() {
        return this._operandInputModel;
    }

    /**
     * Get operator selection model
     *
     * @return {ComparisonSelectionModel} selection model
     */
    get operatorSelectionModel() {
        return this._operatorSelectionModel;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        this._operandInputModel.reset();
        this._operatorSelectionModel.reset();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get normalized() {
        return {
            operator: this._operatorSelectionModel.current,
            limit: this._operandInputModel.value,
        };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isEmpty() {
        return !this._operandInputModel.raw;
    }
}
