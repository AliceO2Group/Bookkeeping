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
 * @typedef SelectionModelConfiguration
 * @property {SelectionOption[]} [availableOptions=[]] the list of available options
 * @property {SelectionOption[]} [defaultSelection=[]] the default selection
 * @property {boolean} [multiple=true] if true, the selection can contain more than one element. Else, any selection will
 *     discard the previous one
 * @property {boolean} [allowEmpty=true] if true, the selection can be empty. Else, deselect will be cancelled if it leads to
 *     empty selection
 */

/**
 * @typedef SelectionOption A picker option, with the actual value and its string representation
 * @property {number|string} value The id of the object this is used to see if it is checked.
 * @property {Component} [label] The representation of the option (if null, value is used as label)
 * @property {string} [rawLabel] The string only representation of the option, useful if the label is not a string
 * @property {string} [selector] If the value of the option is not a valid CSS, this is used to define option's id
 */

/**
 * Model to store any custom user selection of pre-defined options
 */
export class SelectionModel extends Observable {
    /**
     * Constructor
     * @param {SelectionModelConfiguration} [configuration] the model's configuration
     */
    constructor(configuration) {
        super();
        const { availableOptions = [], defaultSelection = [], multiple = true, allowEmpty = true } = configuration || {};

        /**
         * @type {SelectionOption[]}
         * @protected
         */
        this._availableOptions = availableOptions;

        /**
         * @type {SelectionOption[]}
         * @protected
         */
        this._defaultSelection = defaultSelection;

        /**
         * @type {SelectionOption[]}
         * @private
         */
        this._selectedOptions = [...defaultSelection];

        /**
         * @type {boolean}
         * @private
         */
        this._multiple = multiple;

        /**
         * @type {boolean}
         * @private
         */
        this._allowEmpty = allowEmpty;
        if (!this._allowEmpty && this._defaultSelection.length === 0) {
            throw new Error('If empty is not allowed a default selection must be provided');
        }
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
     * Returns the list of options currently provided by the selector
     *
     * Depending on the selector, this may be a filtered subset of all the available options
     *
     * @return {SelectionOption[]} the list of options
     */
    get options() {
        return [
            ...this._availableOptions,
            ...this._defaultSelection.filter((defaultOption) => !this._availableOptions.find(({ value }) => defaultOption.value === value)),
        ];
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
     * If the selection allows one and only one selection, current will return the currently selected option. In any other case it will throw an
     * error
     *
     * @return {string|number} the current selection
     */
    get current() {
        if (this._allowEmpty || this._multiple) {
            throw new Error('"current" is available only in non-multiple select that do not allow empty value');
        }

        return this.selected[0];
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
        const newSelection = this._selectedOptions.filter((selectedOption) => selectedOption.value !== option.value);
        if (this._allowEmpty || newSelection.length > 0) {
            this._selectedOptions = newSelection;
            this.notify();
        }
    }

    /**
     * Add the given option or value to the list of selected ones
     *
     * @param {SelectionOption|number|string} option the option to select
     * @return {void}
     */
    select(option) {
        let selectOption;

        if (typeof option === 'string' || typeof option === 'number' || typeof option === 'boolean' || option === null) {
            selectOption = this._availableOptions.find(({ value }) => value === option);
        } else {
            selectOption = option;
        }

        if (selectOption && !this.isSelected(selectOption)) {
            if (this._multiple || this._selectedOptions.length === 0) {
                this._selectedOptions.push(selectOption);
            } else {
                this._selectedOptions = [selectOption];
            }

            this.notify();
        }
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

    /**
     * States if the selection allows for multiple options to be chosen at the same time
     *
     * @return {boolean} true if multiple options are allowed
     */
    get multiple() {
        return this._multiple;
    }

    /**
     * States if the selection is allowed to be empty
     *
     * @return {boolean} true if the selection can be empty
     */
    get allowEmpty() {
        return this._allowEmpty;
    }

    /**
     * States if the selection is empty
     *
     * @return {boolean} true if the selection is empty
     */
    get isEmpty() {
        return this.selected.length === 0;
    }
}
