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
import { PickerModel } from '../../pickers/tag/PickerModel.js';
import { Observable } from '/js/src/index.js';

/**
 * List of available tags list combination operations
 * @type {{OR: string, AND: string}}
 */
export const CombinationOperation = {
    OR: 'OR',
    AND: 'AND',
};

/**
 * Model to handle the state of a tags filter
 */
export class TagFilterModel extends Observable {
    /**
     * Model's constructor, creating a tag picker model and use OR as a default operator (default are used as initial state and when the filter
     * is reset)
     *
     * @constructor
     *
     * @param {Object[]} defaultSelection the list of tags selected by default
     * @param {boolean} defaultCollapse the default collapse status of the tags picker
     * @param {string} defaultCombinationOperator the default combination operator of the filter
     */
    constructor(defaultSelection = [], defaultCollapse = true, defaultCombinationOperator = CombinationOperation.AND) {
        super();
        this._pickerModel = new PickerModel('tag', defaultSelection, defaultCollapse);
        this._pickerModel.bubbleTo(this);

        this._defaultCombinationOperation = defaultCombinationOperator;
        this._combinationOperation = defaultCombinationOperator;
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
        this._combinationOperation = this._defaultCombinationOperation;
    }

    /**
     * Return the model handling tag picker state
     *
     * @return {TagPickerModel} the tag picker model
     */
    get pickerModel() {
        return this._pickerModel;
    }

    /**
     * Shortcut to get the selected tags in the picker
     *
     * @return {Object[]} the selected tags
     */
    get selected() {
        return this._pickerModel.selected;
    }

    /**
     * Return the operation to use to combine the selected tags into one criterion
     *
     * @return {string} the operation
     */
    get combinationOperation() {
        return this._combinationOperation;
    }

    /**
     * Define the operation to use to combine the selected tags into one criterion
     *
     * @param {string} operation the operation to use
     */
    set combinationOperation(operation) {
        this._combinationOperation = operation;
        this.notify();
    }
}
