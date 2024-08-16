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
import { Observable } from '/js/src/index.js';

/**
 * FloatComparisonFilterModel
 */
export class FloatComparisonFilterModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._visualChange$ = new Observable();

        this._valueInputModel = new FilterInputModel();
        this._valueInputModel.visualChange$.bubbleTo(this._visualChange$);
        this._valueInputModel.bubbleTo(this);
        this._operatorSelectionModel = new ComparisonSelectionModel();
        this._operatorSelectionModel.visualChange$.bubbleTo(this._visualChange$);
        this._operatorSelectionModel.observe(() => {
            if (!this._valueInputModel.isEmpty) {
                this.notify();
            }
        });
    }

    /**
     * Get number input model
     *
     * @return {FilterInputModel} input model
     */
    get valueInputModel() {
        return this._valueInputModel;
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
        this._valueInputModel.reset();
        this._operatorSelectionModel.reset();
    }

    /**
     * Returns current operator and numerical value
     *
     * @return {{ operator: string, value: number }} current filtering
     */
    get current() {
        return {
            operator: this._operatorSelectionModel.current,
            value: this._valueInputModel.value,
        };
    }

    /**
     * States if the filter has been filled
     *
     * @return {boolean} true if the filter has been filled
     */
    get isEmpty() {
        return !this._operatorSelectionModel.current || !this._valueInputModel.raw;
    }

    /**
     * Returns the observable notified any time there is a visual change which has no impact on the actual filter value
     *
     * @return {Observable} the observable
     */
    get visualChange$() {
        return this._visualChange$;
    }
}
