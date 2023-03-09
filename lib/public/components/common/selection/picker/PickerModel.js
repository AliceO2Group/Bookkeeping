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
 * @typedef PickerModelExclusiveConfiguration
 * @property {boolean} [defaultExpand=false] If true, the options list will be expanded by default
 * @typedef {SelectionModelConfiguration & PickerModelExclusiveConfiguration} PickerModelConfiguration
 */

/**
 * Model to handle the state of a tag picker
 */
export class PickerModel extends SelectionModel {
    /**
     * Constructor
     *
     * @param {PickerModelConfiguration} [configuration={}] the picker's configuration
     * @constructor
     */
    constructor(configuration) {
        super(configuration);

        const { defaultExpand = false } = configuration || {};

        this._defaultCollapsed = !defaultExpand;
        this._collapsed = !defaultExpand;
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
        super.reset();
        this._collapsed = this._defaultCollapsed;
    }

    /**
     * Returns the collapse status
     *
     * @return {boolean} true if the picker is collapsed
     */
    get collapsed() {
        return this._collapsed;
    }
}
