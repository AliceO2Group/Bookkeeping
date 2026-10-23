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
import { formatBeamTypeBadge } from './formatBeamTypeBadge.js';

const BEAM_TYPES_DESCRIPTIONS = [
    ['PB82 - PB82', 'Lead ions colliding with lead ions, the main collisions of ALICE'],
    ['PROTON - PROTON', 'Protons colliding with protons'],
    ['PROTON - O8', 'Protons colliding with oxygen ions'],
    ['O8 - O8', 'Oxygen ions colliding with oxygen ions'],
    ['NE10 - NE10', 'Neon ions colliding with neon ions'],
];

/**
 * Render the legend of the beam types, as displayed in the fill column of the LHC fills overview
 *
 * @return {Component} the legend
 */
export const beamTypeLegend = () => h('.flex-column.g3', [
    h('h3', 'Beam type legend'),
    h('.flex-column.g2', BEAM_TYPES_DESCRIPTIONS.map(([beamType, description]) => h('.flex-row.items-baseline.g3', [
        h('.beam-type-legend-label.flex-row', formatBeamTypeBadge(beamType)),
        h('.beam-type-legend-description', description),
    ]))),
    h('span.f7.gray-darker', 'Lead against lead, protons against protons, protons against ions and other ions each have their own shape'),
]);
