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

import { Observable } from '/js/src/index.js';

import { DurationInputModel } from '../../../common/form/inputs/DurationInputModel.js';
import { ComparisonOperatorSelectionModel } from './ComparisonOperatorSelectionModel.js';

/**
 * Duration filter model which stores time value and selected operator
 */
export class DurationFilterModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._visualChange$ = new Observable();

        this._durationInputModel = new DurationInputModel();
        this._durationInputModel.bubbleTo(this);
        this._operatorSelectionModel = new ComparisonOperatorSelectionModel();
        this._operatorSelectionModel.observe(() => {
            if (this._durationInputModel.value === null) {
                this._visualChange$.notify();
            } else {
                this.notify();
            }
        });
    }

    /**
     * Returns the observable notified any time there is a visual change which has no impact on the actual filter value
     *
     * @return {Observable} the observable
     */
    get visualChange$() {
        return this._visualChange$;
    }

    /**
     * Retrun duration input model
     *
     * @return {DurationInputModel} duration input model
     */
    get durationInputModel() {
        return this._durationInputModel;
    }

    /**
     * Return operator selection model
     *
     * @return {ComparisonOperatorSelectionModel} operator selection model
     */
    get operatorSelectionModel() {
        return this._operatorSelectionModel;
    }

    /**
     * States if the filter has been filled
     *
     * @return {boolean} true if the filter has been filled
     */
    isEmpty() {
        return this._durationInputModel.value === null;
    }

    /**
     * Reset the filter to its default value
     *
     * @return {void}
     */
    reset() {
        this._durationInputModel.reset();
        this._operatorSelectionModel.reset();
    }
}
