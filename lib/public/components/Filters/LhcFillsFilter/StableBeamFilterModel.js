/**
 * @license
 * Copyright CERN and copyright holders of ALICE Trg. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-Trg.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { SelectionModel } from '../../common/selection/SelectionModel.js';

/**
 * Stable beam filter filter model
 * Holds true or false value
 */
export class StableBeamFilterModel extends SelectionModel {
    /**
     * Constructor
     * @param {boolean} value if true sets the filter's starting value to be true.
     */
    constructor(value = false) {
        super({ availableOptions: [{ value: true }, { value: false }],
            defaultSelection: [{ value: value }],
            multiple: false,
            allowEmpty: false });
    }

    /**
     * Returns true if the current filter is stable beams only
     *
     * @return {boolean} true if filter is stable beams only
     */
    isStableBeamsOnly() {
        return this.current;
    }

    /**
     * Sets the current filter to stable beams only
     *
     * @param {boolean} value value to set this stable beams only filter with
     * @return {void}
     */
    setStableBeamsOnly(value) {
        this.select({ value });
    }

    /**
     * Get normalized selected option
     */
    get normalized() {
        return this.selected[0];
    }

    /**
     * Reset the filter to default values
     *
     * @return {void}
     */
    resetDefaults() {
        if (!this.isEmpty) {
            this.reset();
            this.notify();
        }
    }
}
