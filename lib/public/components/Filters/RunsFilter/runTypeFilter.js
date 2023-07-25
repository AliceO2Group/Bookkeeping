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
 * Returns a filter component to filter on run types
 * @param {RunTypesSelectionDropdownModel} filter actual selection model.
 * @return {Component} A dropdown selection menu that allows the user to select one or more run types
 */
export const runTypeFilter = (filter) => [
    combinationOperatorChoiceComponent(filter.combinationOperatorModel, { selectorPrefix: 'run-types' }),
    selectionDropdown(filter.selectionModel, { selectorPrefix: 'run-types' }),
];
