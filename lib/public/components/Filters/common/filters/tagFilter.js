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

import { combinationOperatorChoiceComponent } from '../combinationOperatorChoiceComponent.js';
import { selectionDropdown } from '../../../common/selection/dropdown/selectionDropdown.js';

/**
 * Returns a filter component to apply filtering on a defined list of tags
 *
 * @param {TagFilterModel} filter the model storing the filter's state
 *
 * @return {Component} the filter component
 */
export const tagFilter = (filter) => [
    combinationOperatorChoiceComponent(filter.combinationOperatorModel, { selectorPrefix: 'tag-filter' }),
    selectionDropdown(filter.selectionModel, { selectorPrefix: 'tag' }),
];
