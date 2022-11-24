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
import { SelectionModel } from '../SelectionModel.js';
import { Observable, RemoteData } from '/js/src/index.js';
import { ToggleableModel } from '../../toggle/TogglableModel.js';

const OPEN_BY_DEFAULT = false;

/**
 * Model storing the state of a dropdown component
 */
export class SelectionDropdownModel extends SelectionModel {
    /**
     * Constructor
     *
     * @param {RemoteData|SelectionOption[]} availableOptions the list of available options
     * @param {SelectionOption[]} [defaultSelection=[]] the default selection
     * @constructor
     */
    constructor(availableOptions, defaultSelection = []) {
        super({ availableOptions, defaultSelection });
        this._toggleModel = new ToggleableModel(OPEN_BY_DEFAULT);
        this._defaultSelection = defaultSelection;
        this._searchInputContent = '';

        this._visualChange$ = new Observable();
        this._toggleModel.bubbleTo(this.visualChange$);
    }

    /**
     * Open the dropdown
     *
     * @return {void}
     */
    open() {
        this._toggleModel.show();
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
        this._visualChange$.notify();
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
     * Returns the filtered available options
     *
     * @return {RemoteData|SelectionOption[]} the filtered available options
     */
    get options() {
        if (this._searchInputContent && this.availableOptions) {
            // eslint-disable-next-line require-jsdoc
            const filter = ({ label }) => label.includes(this._searchInputContent);
            if (this.availableOptions instanceof RemoteData) {
                if (this.availableOptions.isSuccess()) {
                    return RemoteData.success(this.availableOptions.payload.filter(filter));
                } else {
                    return this.availableOptions;
                }
            }
            return this.availableOptions.filter(filter);
        }

        return this.availableOptions;
    }

    /**
     * Returns the model storing the visibility state of the dropdown
     *
     * @return {ToggleableModel} the visibility model
     */
    get toggleModel() {
        return this._toggleModel;
    }
}
