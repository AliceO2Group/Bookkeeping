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

import { ComparisonOperatorSelectionModel } from './ComparisonOperatorSelectionModel.js';
import { Observable } from '/js/src/index.js';

/**
 * Model storing state of a expected value of something with respect of comprison operator
 */
export class NumericFilterModel extends Observable {
    /**
     * Constructor
     * @param {object} configuration configration
     * @param {number} [configration.minValue] minimal value allowed in model
     * @param {number} [configration.maxValue] maximum value allowed in model
     * @param {number} [configration.defaultOperator] defaultOperator one of ['<', '<=', '=', '>=', '>'] operators
     */
    constructor({ min, max, defaultOperator }) {
        super();

        this._minValue = min;
        this._maxValue = max;

        this._operatorSelectionModel = new ComparisonOperatorSelectionModel(defaultOperator);
        this._operatorSelectionModel.observe(() => {
            if (this._value !== null) {
                this.notify();
            }
        });

        this._value = null;
    }

    /**
     * Get minimum allowed value
     */
    get minValue() {
        return this._minValue;
    }

    /**
     * Get maximum allowed value
     */
    get maxValue() {
        return this._maxValue;
    }

    /**
     * Reset to default
     * @return {void}
     */
    reset() {
        this._value = null;
        this._operatorSelectionModel.reset();
    }

    /**
     * Get value - operand to comparison
     */
    get value() {
        return this._value;
    }

    /**
     * Set current value of operand
     * @param {number} value value
     */
    set value(value) {
        this._value = value;
        this.notify();
    }

    /**
     * Get operator selection model
     */
    get operatorSelectionModel() {
        return this._operatorSelectionModel;
    }
}
