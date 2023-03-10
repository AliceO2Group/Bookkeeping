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
 * @typedef SelectionModelConfiguration
 * @property {RemoteData|SelectionOption[]} [availableOptions=[]] the list of available options
 * @property {SelectionOption[]} [defaultSelection=[]] the default selection
 * @property {boolean} [multiple=true] if true, the selection can contain more than one element. Else, any selection will
 *     discard the previous one
 * @property {allowEmpty} [allowEmpty=true] if true, the selection can be empty. Else, deselect will be cancelled if it leads to
 *     empty selection
 */

/**
 * Model storing a given user selection over a pre-defined list of options
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
         * @type {RemoteData|SelectionOption[]}
         * @private
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

        this._visualChange$ = new Observable();
    }

    /**
     * Returns an observable notified any time a visual change occurs that has no impact on the actual selection
     *
     * @return {Observable} the visual change observable
     */
    get visualChange$() {
        return this._visualChange$;
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
        const newSelection = this._selectedOptions.filter((selectedOption) => selectedOption.value !== option.value);
        if (this._allowEmpty || newSelection.length > 0) {
            this.selectedOptions = newSelection;
            this.notify();
        }
    }

    /**
     * Add the given options to the list of selected ones
     *
     * @param {SelectionOption} option the option to select
     * @return {void}
     */
    select(option) {
        if (!this.isSelected(option)) {
            if (this._multiple || this._selectedOptions.length === 0) {
                this._selectedOptions.push(option);
            } else {
                this._selectedOptions = [option];
            }

            this.notify();
        }
    }

    /**
     * Returns the list of options currently provided by the selector
     *
     * Depending on the selector, this may be a filtered subset of all the available options
     *
     * @return {RemoteData|SelectionOption[]} the list of options
     */
    get options() {
        return this._availableOptions;
    }

    /**
     * Return the list of all the available options
     *
     * @return {RemoteData|SelectionOption[]} the list of available options
     */
    get availableOptions() {
        return this._availableOptions;
    }

    /**
     * Defines the list of available options
     *
     * @param {RemoteData|SelectionOption[]} availableOptions the new available options
     */
    set availableOptions(availableOptions) {
        this._availableOptions = availableOptions;
        this.visualChange$.notify();
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
     * Return the list of options selected by default
     *
     * @return {SelectionOption[]} the list of options selected by default
     */
    get optionsSelectedByDefault() {
        return this._defaultSelection;
    }
}
