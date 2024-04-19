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

const GREEK_LOWER_MU_ENCODING = '\u03BC';

/**
 * Factory for inelastic interaction rate values active columns configuration
 *
 * @param {Run[]} runs list
 * @return {object} active columns configuration
 */
export const createInelasticInteractionRateActiveColumns = (runs) => ({
    muInelasticInteractionRate: {
        name: `${GREEK_LOWER_MU_ENCODING}(INEL)`,
        visible: runs.some((run) => run.pdpBeamType === 'pp'),
        format: formatFloat,
        profiles: {
            runsPerLhcPeriod: { classes: 'f6' },
            runsPerDataPass: { classes: 'f6' },
            runsPerSimulationPass: { classes: 'f6' },
        },
    },
    inelasticInteractionRateAvg: {
        name: h('.flex-wrap', [h('', ['INEL', h('sub', 'avg')]), '(Hz)']),
        format: formatFloat,
        visible: true,
        profiles: {
            runsPerLhcPeriod: { classes: 'f6' },
            runsPerDataPass: { classes: 'f6' },
            runsPerSimulationPass: { classes: 'f6' },
        },
    },
    inelasticInteractionRateAtStart: {
        name: h('.flex-wrap', [h('', ['INEL', h('sub', 'start')]), '(Hz)']),
        visible: runs.some((run) => run.pdpBeamType === 'PbPb'),
        format: formatFloat,
        profiles: {
            runsPerLhcPeriod: { classes: 'f6' },
            runsPerDataPass: { classes: 'f6' },
            runsPerSimulationPass: { classes: 'f6' },
        },
    },
    inelasticInteractionRateAtMid: {
        name: h('.flex-wrap', [h('', ['INEL', h('sub', 'mid')]), '(Hz)']),
        visible: runs.some((run) => run.pdpBeamType === 'PbPb'),
        format: formatFloat,
        profiles: {
            runsPerLhcPeriod: { classes: 'f6' },
            runsPerDataPass: { classes: 'f6' },
            runsPerSimulationPass: { classes: 'f6' },
        },
    },
    inelasticInteractionRateAtEnd: {
        name: h('.flex-wrap', [h('', ['INEL', h('sub', 'end')]), '(Hz)']),
        visible: runs.some((run) => run.pdpBeamType === 'PbPb'),
        format: formatFloat,
        profiles: {
            runsPerLhcPeriod: { classes: 'f6' },
            runsPerDataPass: { classes: 'f6' },
            runsPerSimulationPass: { classes: 'f6' },
        },
    },
});
