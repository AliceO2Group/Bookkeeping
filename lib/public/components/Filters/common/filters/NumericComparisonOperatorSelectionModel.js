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

import { SelectionDropdownModel } from '../../../common/selection/dropdown/SelectionDropdownModel.js';

/**
 * Model storing state of a selection of predfined numerical comparison operators
 */
export class NumericComparisonOperatorSelectionModel extends SelectionDropdownModel {
    /**
     * Constructor
     * @param {string} [defaultOperator = '='] one of ['<', '<=', '=', '>=', '>'] operators
     */
    constructor(defaultOperator = '=') {
        super({
            availableOptions: ['<', '<=', '=', '>=', '>'].map((operator) => ({ value: operator })),
            multiple: false,
            allowEmpty: false,
            defaultSelection: [{ value: defaultOperator }],
        });
    }
}
