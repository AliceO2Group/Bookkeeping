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
    NONE: { label: 'NONE', value: 'none' },
    NONE_OF: { label: 'NONE-OF', value: 'none-of' },
};

const DEFAULT_OPERATORS = [CombinationOperator.AND, CombinationOperator.OR];

/**
 * Model storing the state of a combination operator choice
 */
export class CombinationOperatorChoiceModel extends SelectionModel {
    /**
     * Constructor
     *
     * @param {SelectionOption[]} [operators] the list of possible operators
     */
    constructor(operators) {
        super({
            availableOptions: operators?.length ? operators : DEFAULT_OPERATORS,
            defaultSelection: operators?.length ? operators.slice(0, 1) : [CombinationOperator.AND],
            multiple: false,
            allowEmpty: false,
        });
    }
}
