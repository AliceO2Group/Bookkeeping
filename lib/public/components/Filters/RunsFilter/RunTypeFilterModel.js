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
import { CombinationOperatorChoiceModel } from '../common/CombinationOperatorChoiceModel.js';
import { RunTypesSelectionDropdownModel } from '../../runTypes/RunTypesSelectionDropdownModel.js';

/**
 * Model to handle the state of a runTypes filter
 */
export class RunTypeFilterModel extends Observable {
    /**
     * Constructor
     *
     * @constructor
     */
    constructor() {
        super();
        this._selectionModel = new RunTypesSelectionDropdownModel({ includeArchived: true });
        this._selectionModel.bubbleTo(this);
    }

    /**
     * States if the filter has no run types selected
     *
     * @return {boolean} true if no run types are selected
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
        this._selectionModel.reset();
    }

    /**
     * Return the model handling run type selection state
     *
     * @return {RunTypeSelectionDropdownModel} the run type selection model
     */
    get selectionModel() {
        return this._selectionModel;
    }

    /**
     * Shortcut to get the selected run types
     *
     * @return {string[]|number[]} the selected run types
     */
    get selected() {
        return this._selectionModel.selected;
    }

    /**
     * Returns an observable notified any time a visual change occurs that has no impact on the actual selection
     *
     * @return {Observable} the visual change observable
     */
    get visualChange$() {
        return this._selectionModel.visualChange$;
    }
}
