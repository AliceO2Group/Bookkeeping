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
import { SelectionModel } from './SelectionModel.js';

/**
 * @typedef SelectionOption A picker option, with the actual value and its string representation
 * @property {number|string} value The id of the object this is used to see if it is checked.
 * @property {Component} [label] The representation of the option (if null, value is used as label)
 * @property {string} [rawLabel] The string only representation of the option, useful if the label is not a string
 * @property {string} [selector] If the value of the option is not a valid CSS, this is used to define option's id
 */

/**
 * Model storing a given user selection over a pre-defined list of options
 */
export class FilterableRemoteSelectionModel extends Observable {
    /**
     * Constructor
     * @param {SelectionModelConfiguration} [configuration] the model's configuration
     */
    constructor(configuration) {
        super();
        const { availableOptions = [], defaultSelection = [], multiple = true, allowEmpty = true } = configuration || {};

        this._defaultSelection = defaultSelection;
        this._multiple = multiple;
        this._allowEmpty = allowEmpty;

        /**
         * Optional search text to filter options
         *
         * @type {string}
         * @private
         */
        this._searchInputContent = '';

        this._visualChange$ = new Observable();

        this.setAvailableOptions(availableOptions);
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
     * Reset the selection to the default
     *
     * @return {void}
     */
    reset() {
        this.selectionModel.match({
            Success: (selectionModel) => selectionModel.reset(),
            Other: () => {
                // Do nothing
            },
        });
        this._searchInputContent = '';
    }

    /**
     * States if the current selection is empty
     *
     * @return {boolean} true if the selection is empty
     */
    get isEmpty() {
        return this.selectionModel.match({
            Success: (selectionModel) => selectionModel.isEmpty,
            Other: () => true,
        });
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
     * Defines the list of available options
     *
     * @param {RemoteData<SelectionOption[], *>|SelectionOption[]} availableOptions the new available options
     * @return {void}
     */
    setAvailableOptions(availableOptions) {
        const remoteAvailableOptions = availableOptions instanceof RemoteData
            ? availableOptions
            : RemoteData.success(availableOptions);

        remoteAvailableOptions.match({
            Success: (availableOptions) => {
                const selectionModel = new SelectionModel({
                    availableOptions,
                    defaultSelection: this._defaultSelection,
                    multiple: this._multiple,
                    allowEmpty: this._allowEmpty,
                });
                this.selectionModel = RemoteData.success(selectionModel);
                selectionModel.bubbleTo(this);
            },
            Loading: () => {
                this.selectionModel = RemoteData.loading();
            },
            Failure: (error) => {
                this.selectionModel = RemoteData.failure(error);
            },
            NotAsked: () => {
                this.selectionModel = RemoteData.notAsked();
            },
        });

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
        return this.selectionModel.match({
            Success: (selectionModel) => selectionModel.selected,
            Other: () => [],
        });
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
}
