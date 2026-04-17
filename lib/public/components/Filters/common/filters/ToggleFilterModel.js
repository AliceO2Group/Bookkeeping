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
     * @param {boolean} falseIsEmpty if true, will treat false as empty.
     */
    constructor(toggledByDefault = false, falseIsEmpty = false) {
        super({
            availableOptions: [{ value: true }, { value: false }],
            defaultSelection: [{ value: toggledByDefault }],
            multiple: false,
            allowEmpty: false,
        });

        this._falseIsEmpty = falseIsEmpty;
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
     * @inheritdoc
     */
    get isEmpty() {
        if (!this._falseIsEmpty) {
            return this.current === false;
        }

        return false;
    }
}
