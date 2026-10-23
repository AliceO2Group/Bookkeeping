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
import { EfficiencyLevels } from './efficiencyLevel.js';

const EFFICIENCY_LEVELS_DESCRIPTIONS = [
    [EfficiencyLevels.GREAT, '95.00%', 'Great: 95% and above'],
    [EfficiencyLevels.GOOD, '80.00%', 'Good: from 80% to below 95%'],
    [EfficiencyLevels.FAIR, '70.00%', 'Fair: from 70% to below 80%'],
    [EfficiencyLevels.POOR, '50.00%', 'Poor: from 50% to below 70%'],
    [EfficiencyLevels.BAD, '25.00%', 'Bad: below 50%'],
];

/**
 * Render the legend of the efficiency, as displayed in the efficiency column of the LHC fills overview
 *
 * @return {Component} the legend
 */
export const efficiencyLegend = () => h('.flex-column.g3', [
    h('h3', 'Efficiency legend'),
    h('.flex-column.g2', [
        ...EFFICIENCY_LEVELS_DESCRIPTIONS.map(([level, example, description]) => h('.flex-row.items-baseline.g3', [
            h('.efficiency-legend-label.flex-row', h(`.efficiency.efficiency-${level}`, example)),
            h('.efficiency-legend-description', description),
        ])),
        h('.flex-row.items-baseline.g3', [
            h('.efficiency-legend-label.flex-row', '0.00%'),
            h('.efficiency-legend-description', 'No efficiency, displayed without style'),
        ]),
    ]),
]);
