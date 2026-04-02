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

import { SelectionModel } from '../../common/selection/SelectionModel.js';

/**
 * Model for managing a radiobutton view and state
 */
export class RadioButtonFilterModel extends SelectionModel {
    /**
     * Constructor
     *
     * @param {SelectionOption[]} [availableOptions] the list of possible operators
     * @param {function} [setDefault] function that selects the default from the list of available options. Selects first entry by default
     */
    constructor(availableOptions, setDefault = (options) => [options[0]]) {
        super({
            availableOptions,
            defaultSelection: setDefault(availableOptions),
            multiple: false,
            allowEmpty: false,
        });
    }
}
