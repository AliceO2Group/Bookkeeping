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
import { CombinationOperatorChoiceModel } from './CombinationOperatorChoiceModel.js';
import { TagSelectionDropdownModel } from '../../tag/TagSelectionDropdownModel.js';
import { FilterModel } from './FilterModel.js';

/**
 * Model to handle the state of a tags filter
 */
export class TagFilterModel extends FilterModel {
    /**
     * Constructor
     *
     * @param {SelectionOption} [operators] optionally the list of available operators for the filter
     * @constructor
     */
    constructor(operators) {
        super();
        this._selectionModel = new TagSelectionDropdownModel({ includeArchived: true });
        this._addSubmodel(this._selectionModel);

        this._combinationOperatorModel = new CombinationOperatorChoiceModel(operators);
        this._addSubmodel(this._combinationOperatorModel);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        this._selectionModel.reset();
        this._combinationOperatorModel.reset();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._selectionModel.isEmpty;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get normalized() {
        return {
            values: this.selected.join(),
            operation: this.combinationOperator,
        };
    }

    /**
     * Return the model handling tag selection state
     *
     * @return {TagSelectionDropdownModel} the tag selection model
     */
    get selectionModel() {
        return this._selectionModel;
    }

    /**
     * Shortcut to get the selected tags
     *
     * @return {string[]|number[]} the selected tags
     */
    get selected() {
        return this._selectionModel.selected;
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
