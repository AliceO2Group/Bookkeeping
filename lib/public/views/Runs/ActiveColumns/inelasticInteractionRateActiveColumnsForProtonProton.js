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
import { numericalComparisonFilter } from '../../../components/Filters/common/filters/numericalComparisonFilter.js';

const GREEK_LOWER_MU_CHAR = '\u03BC';

/**
 *  Active columns configuration for inelastic interaction rate values for proton-proton runs
 */
export const inelasticInteractionRateActiveColumnsForProtonProton = {
    muInelasticInteractionRate: {
        name: `${GREEK_LOWER_MU_CHAR}(INEL)`,
        format: formatFloat,

        /**
         * Mu inelastic interaction rate filter component
         *
         * @param {RunsOverviewModel} runsOverviewModel the runs overview model
         * @return {Component} the filtering component
         */
        filter: (runsOverviewModel) => numericalComparisonFilter(
            runsOverviewModel.filteringModel.get('muInelasticInteractionRate'),
            { step: 0.0001, selectorPrefix: 'muInelasticInteractionRate' },
        ),
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
        format: (a) => formatFloat(a),

        /**
         * Inelastic interaction rate avg filter component
         *
         * @param {RunsOverviewModel} runsOverviewModel the runs overview model
         * @return {Component} the filtering component
         */
        filter: (runsOverviewModel) => numericalComparisonFilter(
            runsOverviewModel.filteringModel.get('inelasticInteractionRateAvg'),
            { step: 0.0001, selectorPrefix: 'inelasticInteractionRateAvg' },
        ),
        visible: true,
        classes: 'f6',
        profiles: [
            'runsPerLhcPeriod',
            'runsPerDataPass',
            'runsPerSimulationPass',
        ],
    },
};
