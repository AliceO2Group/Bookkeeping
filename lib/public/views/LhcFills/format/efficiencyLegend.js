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
import { formatPercentage } from '../../../utilities/formatting/formatPercentage.js';
import { EFFICIENCY_SCALE } from './efficiencyLevel.js';

/**
 * Format a limit of the scale of the efficiency (e.g. 95%)
 *
 * @param {number} efficiency the efficiency, normalized between 0 and 1
 * @return {string} the formatted limit
 */
const formatLimit = (efficiency) => formatPercentage(efficiency, 0);

/**
 * Describe the range of efficiencies of the level at the given index of the scale
 *
 * @param {number} index the index of the level in the scale
 * @return {string} the description of the range
 */
const describeRange = (index) => {
    const { minimum } = EFFICIENCY_SCALE[index];
    if (index === 0) {
        return `${formatLimit(minimum)} and above`;
    }

    const upperLimit = formatLimit(EFFICIENCY_SCALE[index - 1].minimum);
    return index === EFFICIENCY_SCALE.length - 1 ? `Below ${upperLimit}` : `From ${formatLimit(minimum)} to below ${upperLimit}`;
};

/**
 * Render the legend of the efficiency, as displayed in the efficiency column of the LHC fills overview. It is generated from the scale of the
 * efficiency
 *
 * @return {Component} the legend
 */
export const efficiencyLegend = () => h('.flex-column.g3', [
    h('h3', 'Efficiency legend'),
    h('.flex-column.g2', [
        ...EFFICIENCY_SCALE.map(({ level }, index) => h('.flex-row.items-baseline.g3', [
            h('.efficiency-legend-label.flex-row', h(`.efficiency.efficiency-${level}`, `${level[0].toUpperCase()}${level.slice(1)}`)),
            h('.efficiency-legend-description', describeRange(index)),
        ])),
        h('.flex-row.items-baseline.g3', [
            h('.efficiency-legend-label.flex-row', '0.00%'),
            h('.efficiency-legend-description', 'No efficiency, displayed without style'),
        ]),
    ]),
]);
