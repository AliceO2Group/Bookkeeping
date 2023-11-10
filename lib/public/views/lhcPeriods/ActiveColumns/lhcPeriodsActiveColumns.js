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
import { frontLink } from '../../../components/common/navigation/frontLink.js';

/**
 * List of active columns for a generic periods table
 */
export const lhcPeriodsActiveColumns = {
    id: {
        name: 'id',
        visible: false,
    },

    name: {
        name: 'Name',
        visible: true,
        format: (_, lhcPeriod) => [
            h('td.text-ellipsis', lhcPeriod.name),
            h(
                'td',
                frontLink(
                    'runs',
                    'runs-per-period',
                    {},
                    {
                        class: 'btn linkDisabled',
                    },
                ),

                frontLink(
                    'data passes',
                    'data-passes-per-period',
                    {},
                    {
                        class: 'btn linkDisabled',
                    },
                ),

                frontLink(
                    'MC',
                    'mc-per-period',
                    {},
                    {
                        class: 'btn linkDisabled',
                    },
                ),
            ),
        ],
    },

    avgEnergy: {
        name: 'Mean energy [GeV]',
        visible: true,
        format: (_, lhcPeriod) => `${Number(lhcPeriod.avgEnergy).toFixed(2)}`,
    },
};
