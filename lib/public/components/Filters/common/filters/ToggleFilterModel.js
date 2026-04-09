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
import { SelectionModel } from '../../../common/selection/SelectionModel.js';

/**
 * Filtering model to handle raw text value
 */
export class ToggleFilterModel extends SelectionModel {
    /**
     * Constructor
     * @param {boolean} toggledByDefault If the filter should be toggled by default
     */
    constructor(toggledByDefault) {
        super({ availableOptions: [{ value: true }, { value: false }],
            defaultSelection: [{ value: toggledByDefault }],
            multiple: false,
            allowEmpty: false });
    }

    /**
     * Returns true if the current value is set to true
     *
     * @return {boolean} true if filter is stable beams only
     */
    isToggled() {
        return this.current;
    }

    /**
     * Toggles the filter state
     *
     * @return {void}
     */
    toggle() {
        this.select({ value: !this.current });
    }

    /**
     * Overrides SelectionModel.isEmpty to respect the fact that toggle filters cannot be empty.
     * @returns {boolean} true if the current value of the filter is false.
     */
    get isEmpty() {
        return this.current === false;
    }
}
