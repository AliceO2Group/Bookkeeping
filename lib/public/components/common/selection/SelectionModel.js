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
import { Observable, RemoteData } from '/js/src/index.js';

/**
 * @typedef SelectionOption A picker option, with the actual value and its string representation
 * @property {number|string} value The id of the object this is used to see if it is checked.
 * @property {Component} [label] The representation of the option (if null, value is used as label)
 * @property {string} [rawLabel] The string only representation of the option, useful if the label is not a string
 * @property {string} [selector] If the value of the option is not a valid CSS, this is used to define option's id
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
         * @type {RemoteData<SelectionOption[]>|SelectionOption[]}
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

        /**
         * Optional search text to filter options
         *
         * @type {string}
         * @private
         */
        this._searchInputContent = '';

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
     * Add the given option or value to the list of selected ones
     *
     * @param {SelectionOption|number|string} option the option to select
     * @return {void}
     */
    select(option) {
        let selectOption;

        if (typeof option === 'string' || typeof option === 'number') {
            if (this._availableOptions instanceof RemoteData) {
                selectOption = this._availableOptions.match({
                    Success: (options) => options.find(({ value }) => value === option),
                    Other: () => null,
                });
            } else {
                selectOption = this._availableOptions.find(({ value }) => value === option);
            }
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
     * Returns the content of the search input
     *
     * @return {string} the search input content
     */
    get searchInputContent() {
        return this._searchInputContent;
    }

    /**
     * Stores the content of the search input
     *
     * @param {string} value the new search input content
     */
    set searchInputContent(value) {
        this._searchInputContent = value;
        this.visualChange$.notify();
    }

    /**
     * Returns the list of options currently provided by the selector
     *
     * Depending on the selector, this may be a filtered subset of all the available options
     *
     * @return {RemoteData<SelectionOption[], *>|SelectionOption[]} the list of options
     */
    get options() {
        /**
         * Add the default options to the list of given options
         *
         * @param {SelectionOption[]} options the options to which default selection should be added
         * @return {SelectionOption[]} the options list including default options
         */
        const addDefaultToOptions = (options) => [
            ...options,
            ...this.optionsSelectedByDefault.filter((defaultOption) => !options.find(({ value }) => defaultOption.value === value)),
        ];

        /**
         * Apply the current search filtering on option
         *
         * @param {SelectionOption} option the option to filter
         * @return {boolean} true if the option matches the current search
         */
        const filter = this._searchInputContent ?
            ({ rawLabel, label, value }) => (rawLabel || label || value).toUpperCase().includes(this._searchInputContent.toUpperCase())
            : null;

        /**
         * Prepare the list of options by adding default and apply filter if needed
         *
         * @param {SelectionOption[]} options the list of options to prepare
         * @return {SelectionOption[]} the prepared options
         */
        const prepareOptions = (options) => {
            let actualOptions = addDefaultToOptions(options);
            if (filter) {
                actualOptions = options.filter(filter);
            }
            return actualOptions;
        };

        return this._availableOptions instanceof RemoteData
            ? this._availableOptions.apply({
                Success: prepareOptions,
            })
            : prepareOptions(this._availableOptions);
    }

    /**
     * Defines the list of available options
     *
     * @param {RemoteData<SelectionOption[], *>|SelectionOption[]} availableOptions the new available options
     * @return {void}
     */
    setAvailableOptions(availableOptions) {
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
