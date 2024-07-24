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

        this._initialize();
    }

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
