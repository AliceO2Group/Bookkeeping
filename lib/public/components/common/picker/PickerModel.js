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
 * @typedef PickerOption A picker option, with the actual value and its string representation
 * @property {number|string} value The id of the object this is used to see if it is checked.
 * @property {Component} [label] The representation of the option (if null, value is used as label)
 */

/**
 * Model to handle the state of a tag picker
 */
export class PickerModel extends Observable {
    /**
     * Model's constructor, collapsed and without selection as a default (default are used as initial state and when the picker is reset)
     *
     * @param {PickerOption[]} defaultSelection the default selection of tags
     * @param {boolean} defaultCollapsed true if the tags must be collapsed as a default
     * @constructor
     */
    constructor(defaultSelection = [], defaultCollapsed = true) {
        super();

        /**
         * @type {PickerOption[]}
         * @private
         */
        this._defaultSelection = defaultSelection;

        /**
         * @type {PickerOption[]}
         * @private
         */
        this._selectedOptions = [...defaultSelection];

        this._defaultCollapsed = defaultCollapsed;
        this._collapsed = defaultCollapsed;
    }

    /**
     * States if the picker selection is exactly the default one
     *
     * @return {boolean} true if the selection is the default one
     */
    hasOnlyDefaultSelection() {
        const { selected } = this;
        const defaultSelection = [...new Set(this._defaultSelection.map(({ value }) => value))];

        return selected.length === defaultSelection.length && selected.every((item) => defaultSelection.includes(item));
    }

    /**
     * If the picker is collapsed expand it, else collapse it
     *
     * @return {void}
     */
    toggleCollapse() {
        this._collapsed = !this._collapsed;
        this.notify();
    }

    /**
     * Reset the model to its default state
     *
     * @return {void}
     */
    reset() {
        this._selectedOptions = [...this._defaultSelection];
        this._collapsed = this._defaultCollapsed;
    }

    /**
     * States if the current picker is currently checked or not
     *
     * @param {PickerOption} option the option to check for selected state
     * @return {boolean} true if the given picker is checked
     */
    isSelected(option) {
        return this._selectedOptions.find((selectedOption) => option.value === selectedOption.value) !== undefined;
    }

    /**
     * Remove the given option from the list of selected ones
     *
     * @param {PickerOption} option the option to deselect
     * @return {void}
     */
    deselect(option) {
        this.selectedOptions = this._selectedOptions.filter((selectedOption) => selectedOption.value !== option.value);
    }

    /**
     * Add the given options to the list of selected ones
     *
     * @param {PickerOption} option the option to select
     * @return {void}
     */
    select(option) {
        if (!this.isSelected(option)) {
            this._selectedOptions.push(option);
        }
        this.notify();
    }

    /**
     * Returns the collapse status
     *
     * @return {boolean} true if the picker is collapsed
     */
    get collapsed() {
        return this._collapsed;
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
     * @return {PickerOption[]} the currently selected options
     */
    get selectedOptions() {
        return this._selectedOptions;
    }

    /**
     * Define (overrides) the list of currently selected tags
     *
     * @param {PickerOption[]} selected the list of selected tags
     */
    set selectedOptions(selected) {
        this._selectedOptions = selected;
        this.notify();
    }
}
