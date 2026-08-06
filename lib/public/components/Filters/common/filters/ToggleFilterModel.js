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
 * SelectionModel that restricts the selection to a boolean toggle (true/false).
 */
export class ToggleFilterModel extends SelectionModel {
    /**
     * Constructor
     * @param {boolean} toggledByDefault If the filter should be toggled by default
     * @param {boolean} defaultIsInactive if true, will treat the untoggled state (false) as empty.
     */
    constructor(toggledByDefault = false, defaultIsInactive = false) {
        super({
            availableOptions: [{ value: true }, { value: false }],
            defaultSelection: [{ value: toggledByDefault }],
            multiple: false,
            allowEmpty: false,
        });

        this._defaultIsInactive = defaultIsInactive;
    }

    /**
     * Returns true if the current value is set to true
     *
     * @return {boolean} true if filter is stable beams only
     */
    get isToggled() {
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
     * Toggles are always filled, as 'false' / untoggled is also considered a value
     *
     * @return {boolean} `false`
     */
    get isEmpty() {
        return false;
    }

    /**
     * Returns if the toggle filter is considered 'inactive'
     *
     * @return {boolean}
     */
    get isInactive() {
        if (this._defaultIsInactive) {
            return this.hasOnlyDefaultSelection();
        }

        return false;
    }
}
