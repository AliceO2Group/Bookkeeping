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
import { CombinationOperatorChoiceModel, NoneCombinationOperator } from '../common/CombinationOperatorChoiceModel.js';
import { DetectorSelectionDropdownModel } from '../../detector/DetectorSelectionDropdownModel.js';

/**
 * Model to store the state of the filtering on a detectors list
 */
export class DetectorsFilterModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._dropdownModel = new DetectorSelectionDropdownModel();
        this._dropdownModel.bubbleTo(this);

        this._combinationOperatorModel = new CombinationOperatorChoiceModel(true);
        this._combinationOperatorModel.bubbleTo(this);
    }

    /**
     * States if the filter has no tags selected
     *
     * @return {boolean} true if no tags are selected
     */
    isEmpty() {
        return this.selected.length === 0 && !this.isNone();
    }

    /**
     * Return true if the current combination operator is none
     *
     * @return {boolean} true if the current combination operator is none
     */
    isNone() {
        return this.combinationOperator === NoneCombinationOperator.value;
    }

    /**
     * Reset the model to its default state
     *
     * @return {void}
     */
    reset() {
        this._dropdownModel.reset();
        this._combinationOperatorModel.reset();
    }

    /**
     * Return the model storing the list of selected detectors
     *
     * @return {DetectorSelectionDropdownModel} the detectors selection model
     */
    get dropdownModel() {
        return this._dropdownModel;
    }

    /**
     * Shortcut to get the list of selected detectors
     */
    get selected() {
        return this._dropdownModel.selected;
    }

    /**
     * Return the model storing the combination operator to apply on the list of detectors
     *
     * @return {CombinationOperatorChoiceModel} the model
     */
    get combinationOperatorModel() {
        return this._combinationOperatorModel;
    }

    /**
     * Shortcut to get the current combination operator
     *
     * @return {string} the current operator
     */
    get combinationOperator() {
        return this._combinationOperatorModel.current;
    }

    /**
     * Returns an observable notified any time a visual change occurs that has no impact on the actual selection
     *
     * @return {Observable} the visual change observable
     */
    get visualChange$() {
        return this._dropdownModel.visualChange$;
    }
}
