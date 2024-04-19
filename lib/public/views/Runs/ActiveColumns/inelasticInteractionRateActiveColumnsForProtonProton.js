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
import { formatFloat } from '../../../utilities/formatting/formatFloat.js';

const GREEK_LOWER_MU_CHAR = '\u03BC';

/**
 * Factory for inelastic interaction rate values for pp runs active columns configuration
 */
export const inelasticInteractionRateActiveColumnsForProtonProton = {
    muInelasticInteractionRate: {
        name: `${GREEK_LOWER_MU_CHAR}(INEL)`,
        format: formatFloat,
        visible: true,
        classes: 'f6',
        profiles: [
            'runsPerLhcPeriod',
            'runsPerDataPass',
            'runsPerSimulationPass',
        ],
    },
    inelasticInteractionRateAvg: {
        name: h('.flex-wrap', [h('', ['INEL', h('sub', 'avg')]), '(Hz)']),
        format: formatFloat,
        visible: true,
        classes: 'f6',
        profiles: [
            'runsPerLhcPeriod',
            'runsPerDataPass',
            'runsPerSimulationPass',
        ],
    },
};
