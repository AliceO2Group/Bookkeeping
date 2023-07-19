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

import { selectionDropdown } from '../../common/selection/dropdown/selectionDropdown.js';
import { combinationOperatorChoiceComponent } from '../common/combinationOperatorChoiceComponent.js';

/**
 * Returns a filter component to filter on environment Ids, either a comma separated list of specific ids or a substring
 * search
 * @param {RunTypesSelectionDropdownModel} filter actual selection model.
 * @return {Component} A text box that allows the user to enter an environment substring to match against all runs or a
 *     list of environment ids
 */
export const runTypeFilter = (filter) => [
    combinationOperatorChoiceComponent(filter.combinationOperatorModel, { selector: 'runTypes' }),
    selectionDropdown(filter.selectionModel, { selector: 'runTypes' })
]
