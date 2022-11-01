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

/**
 * @typedef SelectionOption A picker option, with the actual value and its string representation
 * @property {number|string} value The id of the object this is used to see if it is checked.
 * @property {Component} [label] The representation of the option (if null, value is used as label)
 */

/**
 * Model storing a given user selection over a pre-defined list of options
 */
export class SelectionModel extends Observable {
    /**
     * Constructor
     * @param {SelectionOption[]} [defaultSelection=[]] the default selection
     */
    constructor(defaultSelection = []) {
        super();

        /**
         * @type {SelectionOption[]}
         * @private
         */
        this._defaultSelection = defaultSelection;

        /**
         * @type {SelectionOption[]}
         * @private
         */
        this._selectedOptions = [...defaultSelection];
    }

    /**
     * States if the current selection is exactly the default one
     *
     * @return {boolean} true if the selection is the default one
     */
    hasOnlyDefaultSelection() {
        const { selected } = this;
        const defaultSelection = [...new Set(this._defaultSelection.map(({ value }) => value))];

        return selected.length === defaultSelection.length && selected.every((item) => defaultSelection.includes(item));
    }

    /**
     * Reset the selection to the default
     *
     * @return {void}
     */
    reset() {
        this._selectedOptions = [...this._defaultSelection];
    }

    /**
     * States if the given option is in the current selection or not
     *
     * @param {SelectionOption} option the option to check for selected state
     * @return {boolean} true if the given option is checked
     */
    isSelected(option) {
        return this._selectedOptions.find((selectedOption) => option.value === selectedOption.value) !== undefined;
    }

    /**
     * Remove the given option from the list of selected ones
     *
     * @param {SelectionOption} option the option to deselect
     * @return {void}
     */
    deselect(option) {
        this.selectedOptions = this._selectedOptions.filter((selectedOption) => selectedOption.value !== option.value);
    }

    /**
     * Add the given options to the list of selected ones
     *
     * @param {SelectionOption} option the option to select
     * @return {void}
     */
    select(option) {
        if (!this.isSelected(option)) {
            this._selectedOptions.push(option);
        }
        this.notify();
    }

    /**
     * Return the **values** of the currently selected options
     *
     * Do not use this getter to modify the selected list but use the `selected` setter to define the new selected list and to notify observers
     *
     * @return {string[]|number[]} the values of the selected options
     */
    get selected() {
        return [...new Set(this._selectedOptions.map(({ value }) => value))];
    }

    /**
     * Return the list of currently selected options
     *
     * @return {SelectionOption[]} the currently selected options
     */
    get selectedOptions() {
        return this._selectedOptions;
    }

    /**
     * Define (overrides) the list of currently selected options
     *
     * @param {SelectionOption[]} selected the list of selected options
     */
    set selectedOptions(selected) {
        this._selectedOptions = selected;
        this.notify();
    }
}
