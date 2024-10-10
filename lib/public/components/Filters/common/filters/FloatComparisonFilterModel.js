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
import { FilterInputModel } from './FilterInputModel.js';

/**
 * FloatComparisonFilterModel
 */
export class FloatComparisonFilterModel extends FilterInputModel {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._operandInputModel = new FilterInputModel();
        this._operandInputModel.visualChange$.bubbleTo(this._visualChange$);
        this._operandInputModel.bubbleTo(this);
        this._operatorSelectionModel = new ComparisonSelectionModel();
        this._operatorSelectionModel.visualChange$.bubbleTo(this._visualChange$);
        this._operatorSelectionModel.observe(() => {
            if (!this._operandInputModel.isEmpty) {
                this.notify();
            }
        });
    }

    /**
     * Get number input model
     *
     * @return {FilterInputModel} input model
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

    /**
     * Reset the filter to its default value
     *
     * @return {void}
     */
    reset() {
        this._operandInputModel.reset();
        this._operatorSelectionModel.reset();
    }

    /**
     * Returns current operator and numerical value
     *
     * @return {{ operator: string, operand: number }} current filtering parameters
     */
    get value() {
        return {
            operator: this._operatorSelectionModel.selectedOptions[0].label,
            operand: this._operandInputModel.value,
        };
    }

    /**
     * States if the filter has been filled
     *
     * @return {boolean} true if the filter has been filled
     */
    get isEmpty() {
        return !this._operatorSelectionModel.current || !this._operandInputModel.raw;
    }
}
