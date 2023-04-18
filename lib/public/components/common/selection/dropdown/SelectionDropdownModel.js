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
import { RemoteData } from '/js/src/index.js';
import { ToggleableModel } from '../../toggle/TogglableModel.js';

const OPEN_BY_DEFAULT = false;

/**
 * @typedef SelectionDropdownModelExclusiveConfiguration
 * @property {boolean} [initializeNow=false] if true, the initialization will not be delayed until the first opening but run at instantiation
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

        const { initializeNow = false } = configuration || {};

        this._toggleModel = new ToggleableModel(OPEN_BY_DEFAULT);
        this._searchInputContent = '';

        this._toggleModel.bubbleTo(this.visualChange$);

        this._initializeOnOpen = !initializeNow;
        if (initializeNow) {
            this._initialize();
        }
        this._toggleModel.observe(() => {
            if (this._toggleModel.isVisible && this._initializeOnOpen) {
                // Do not initialize twice
                this._initializeOnOpen = false;
                this._initialize();
            }
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
     * Returns the filtered available options
     *
     * @return {RemoteData|SelectionOption[]} the filtered available options
     */
    get options() {
        if (this._searchInputContent && this.availableOptions) {
            // eslint-disable-next-line require-jsdoc
            const filter = ({ label, value }) => (label || value).toUpperCase().includes(this._searchInputContent.toUpperCase());
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

    /**
     * Initialize the model, in constructor or at first opening depending on the configuration
     *
     * @return {void}
     * @protected
     */
    _initialize() {
    }
}
