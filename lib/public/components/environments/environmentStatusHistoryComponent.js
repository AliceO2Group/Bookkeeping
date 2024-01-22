/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { environmentStatusHistoryLegendComponent } from './environmentStatusHistoryLegendComponent.js';
import { tooltip } from '../common/popover/tooltip.js';

/**
 * Returns a tooltip legend for the environment status history acronyms.
 *
 * @param {Component} trigger the element which will display the status history legend when hovered
 * @return {Component} the resulting environment status history component
 */
export const environmentStatusHistoryComponent = (trigger) =>
    tooltip(trigger, environmentStatusHistoryLegendComponent());
