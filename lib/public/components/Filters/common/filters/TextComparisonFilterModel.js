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
import { RawTextFilterModel } from './RawTextFilterModel.js';

/**
 * TextComparisonFilterModel
 */
export class TextComparisonFilterModel extends FilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._operatorSelectionModel = new ComparisonSelectionModel();
        this._operatorSelectionModel.visualChange$.bubbleTo(this._visualChange$);

        this._operandInputModel = new RawTextFilterModel();
        this._operandInputModel.visualChange$.bubbleTo(this._visualChange$);
        this._operandInputModel.bubbleTo(this);

        this._operatorSelectionModel.observe(() => this._operandInputModel.value ? this.notify() : this._visualChange$.notify());
    }

    /**
     * Return raw text filter model
     *
     * @return {RawTextFilterModel} operand input model
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
     * @inheritDoc
     */
    reset() {
        this._operandInputModel.reset();
        this._operatorSelectionModel.reset();
    }

    /**
     * @inheritDoc
     */
    get normalized() {
        return {
            operator: this._operatorSelectionModel.current,
            limit: this._operandInputModel.value,
        };
    }

    /**
     * @inheritDoc
     */
    get isEmpty() {
        return !this._operandInputModel.value;
    }
}
