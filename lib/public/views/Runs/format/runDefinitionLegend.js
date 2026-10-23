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

import { h } from '/js/src/index.js';
import { RunDefinition } from '../../../domain/enums/RunDefinition.js';

const DEFINITIONS_DESCRIPTIONS = [
    [RunDefinition.Physics, 'Run taken during stable beams, with the detectors and the components required for physics data taking'],
    [RunDefinition.Cosmics, 'Run taken without beam, with the components required for data taking'],
    [RunDefinition.Technical, 'Run reading the front-end electronics'],
    [RunDefinition.Synthetic, 'Run at the level of readout, emulating the readout'],
    [RunDefinition.Calibration, 'Calibration, pedestal, laser, pulser or noise run, displayed with its calibration status below'],
    [RunDefinition.Commissioning, 'Any run that does not fit the other definitions'],
];

/**
 * Render the legend of the run definitions, as displayed in the run column of the runs overview
 *
 * @return {Component} the legend
 */
export const runDefinitionLegend = () => h('.flex-column.g3', [
    h('h3', 'Run definition legend'),
    h('.flex-column.g2', DEFINITIONS_DESCRIPTIONS.map(([definition, description]) => h('.flex-row.items-baseline.g3', [
        h('.run-definition-legend-label.flex-row', h(`.run-definition.run-definition-${definition.toLowerCase()}`, definition)),
        h('.run-definition-legend-description', description),
    ]))),
    h('span.f7.gray-darker', 'The definition is displayed before the quality of the run'),
]);
