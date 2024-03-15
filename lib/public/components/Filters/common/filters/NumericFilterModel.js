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

import { NumericComparisonOperatorSelectionModel } from './NumericComparisonOperatorSelectionModel.js';
import { Observable } from '/js/src/index.js';

/**
 * Model storing state of a expected value of something with respect of comprison operator
 */
export class NumericFilterModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._operatorSelectionModel = new NumericComparisonOperatorSelectionModel();
        this._operatorSelectionModel.observe(() => {
            if (this._value !== null) {
                this.notify();
            }
        });

        this._value = null;
    }

    /**
     * Resotre to default
     * @return {void}
     */
    reset() {
        this._value = null;
        this._operatorSelectionModel.reset();
    }

    /**
     * Get value - operand in comparison
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
