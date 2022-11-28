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
import { PickerModel } from '../../common/selection/picker/PickerModel.js';
import { Observable } from '/js/src/index.js';
import { CombinationOperatorChoiceModel } from './CombinationOperatorChoiceModel.js';

/**
 * Model to handle the state of a tags filter
 */
export class TagFilterModel extends Observable {
    /**
     * Constructor
     *
     * @constructor
     */
    constructor() {
        super();
        this._pickerModel = new PickerModel();
        this._pickerModel.bubbleTo(this);

        this._combinationOperatorModel = new CombinationOperatorChoiceModel();
        this._combinationOperatorModel.bubbleTo(this);
    }

    /**
     * States if the filter has no tags selected
     *
     * @return {boolean} true if no tags are selected
     */
    isEmpty() {
        return this.selected.length === 0;
    }

    /**
     * Reset the model to its default state
     *
     * @return {void}
     */
    reset() {
        this._pickerModel.reset();
        this._combinationOperatorModel.reset();
    }

    /**
     * Return the model handling tag picker state
     *
     * @return {PickerModel} the tag picker model
     */
    get pickerModel() {
        return this._pickerModel;
    }

    /**
     * Shortcut to get the selected tags in the picker
     *
     * @return {string[]|number[]} the selected tags
     */
    get selected() {
        return this._pickerModel.selected;
    }

    /**
     * Return the model handling the combination operator state
     *
     * @return {CombinationOperatorChoiceModel} the combination operator model
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
}
