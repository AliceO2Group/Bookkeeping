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
 * @typedef {SelectionModelConfiguration} FilterableRemoteSelectionModelConfiguration
 * @property {RemoteData<SelectionOption[], *>} [availableOptions=[]] the list of available options
 */

/**
 * Model storing a given user selection over a pre-defined list of options
 */
export class FilterableRemoteSelectionModel extends Observable {
    /**
     * Constructor
     * @param {FilterableRemoteSelectionModelConfiguration} [configuration] the model's configuration
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

        this._selectionModel = RemoteData.notAsked();
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
        this._selectionModel.match({
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
        return this._selectionModel.match({
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
                this._selectionModel = RemoteData.success(selectionModel);
                selectionModel.bubbleTo(this);
            },
            Loading: () => {
                this._selectionModel = RemoteData.loading();
            },
            Failure: (error) => {
                this._selectionModel = RemoteData.failure(error);
            },
            NotAsked: () => {
                this._selectionModel = RemoteData.notAsked();
            },
        });

        this.visualChange$.notify();
    }

    /**
     * Return the **values** of the currently selected options
     *
     * @return {string[]|number[]} the values of the selected options
     */
    get selected() {
        return this._selectionModel.match({
            Success: (selectionModel) => selectionModel.selected,
            Other: () => [],
        });
    }

    /**
     * Return the list of available options
     */
    get options() {
        return this._selectionModel.match({
            Success: (selectionModel) => selectionModel.options,
            Other: () => [],
        });
    }

    /**
     * Return the underlying selection model
     *
     * @return {RemoteData<SelectionModel, ApiError>} the selection model
     */
    get selectionModel() {
        return this._selectionModel;
    }
}
