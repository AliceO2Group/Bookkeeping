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
import { RemoteData } from '@aliceo2/web-ui-frontend';

/**
 * @typedef SelectionDropdownModelExclusiveConfiguration
 * @private
 * @typedef {SelectionModelConfiguration & SelectionDropdownModelExclusiveConfiguration} SelectionDropdownModelConfiguration
 */

/**
 * Model storing the state of a dropdown component
 */
export class SelectionDropdownModel extends SelectionModel {
    /**
     * Constructor
     *
     * @param {SelectionDropdownModelConfiguration} [configuration={}] the model's configuration
     * @constructor
     */
    constructor(configuration) {
        super(configuration);
        this._searchInputContent = '';

        this._initialize();
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
     * Returns the filtered available options
     *
     * @return {RemoteData|SelectionOption[]} the filtered available options
     */
    get options() {
        if (this._searchInputContent && this.availableOptions) {
            // eslint-disable-next-line require-jsdoc
            const filter = ({ rawLabel, label, value }) => (rawLabel || label || value)
                .toUpperCase()
                .includes(this._searchInputContent.toUpperCase());
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

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        super.reset();
        this._searchInputContent = '';
    }

    /**
     * Initialize the model, in constructor or at first opening depending on the configuration
     *
     * @return {void}
     * @protected
     */
    _initialize() {
    }
}
