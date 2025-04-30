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
 * Returns the detectors filter component
 *
 * @param {DetectorsFilterModel} detectorsFilterModel the detectors filter model
 * @return {Component} the detectors filtering component
 */
export const detectorsFilterComponent = (detectorsFilterModel) => [
    combinationOperatorChoiceComponent(detectorsFilterModel.combinationOperatorModel, { selectorPrefix: 'detector-filter' }),
    !detectorsFilterModel.isNone() && selectionDropdown(detectorsFilterModel.dropdownModel, { selectorPrefix: 'detector-filter' }),
];
