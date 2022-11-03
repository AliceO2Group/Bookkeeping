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
 * List of available tags list combination operations
 * @type {{OR: SelectionOption, AND: SelectionOption}}
 */
export const CombinationOperator = {
    OR: { label: 'OR', value: 'or' },
    AND: { label: 'AND', value: 'and' },
};

export const NoneCombinationOperator = { label: 'NONE', value: 'none' };

/**
 * Returns the list of available combination operator
 *
 * @param {boolean} allowNone if true, a "NONE" combination operator will be added
 * @return {SelectionOption[]} the available options
 */
const getAvailableCombinations = (allowNone) => {
    const ret = [...Object.values(CombinationOperator)];
    if (allowNone) {
        ret.push(NoneCombinationOperator);
    }
    return ret;
};

/**
 * Model storing the state of a combination operator choice
 */
export class CombinationOperatorChoiceModel extends SelectionModel {
    /**
     * Constructor
     *
     * @param {boolean} allowNone if true, a "NONE" option will be added to the available combination options
     */
    constructor(allowNone = false) {
        super({
            availableOptions: getAvailableCombinations(allowNone),
            defaultSelection: [CombinationOperator.AND],
            multiple: false,
            allowEmpty: false,
        });
    }
}
