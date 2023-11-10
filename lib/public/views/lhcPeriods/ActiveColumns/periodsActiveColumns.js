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
import { getClosestDefinedEnergy, extractPeriodYear } from './utils.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

const distinctEnergyFormatConfiguration = {
    values: {
        450: 450,
        6800: 6800,
        7000: 7000,
        '5360/2': 2680,
    },
    acceptableMargin: 0.01,
};

const acceptableEnergyValues = distinctEnergyFormatConfiguration.values;
const acceptableEnergyMargin = distinctEnergyFormatConfiguration.acceptableMargin;

const noRelatedDataClass = 'bg-gray-light';

/**
 * List of active columns for a generic periods table
 */
export const periodsActiveColumns = {
    id: {
        name: 'id',
        visible: false,
    },

    name: {
        name: 'Name',
        visible: true,
        format: (lhcPeriod) => [
            h('td.text-ellipsis', lhcPeriod.name),
            h(
                'td',
                frontLink(
                    ['runs', h('sub', `[${lhcPeriod.runsCount}]`)],
                    'runs-per-period',
                    {},
                    lhcPeriod.runsCount === 0 ? noRelatedDataClass : '',
                ),

                frontLink(
                    ['data passes', h('sub', `[${lhcPeriod.dataPassesCount}]`)],
                    'data-passes-per-period',
                    {},
                    lhcPeriod.dataPassesCount === 0 ? noRelatedDataClass : '',
                ),

                frontLink(
                    ['MC', h('sub', `[${lhcPeriod.simulationPassesCount}]`)],
                    'mc-per-period',
                    {},
                    lhcPeriod.simulationPassesCount === 0 ? noRelatedDataClass : '',
                ),
            ),
        ],
    },

    beamType: {
        name: 'Beam Type',
        visible: false,
        format: (lhcPeriod) => lhcPeriod.beamType,
    },

    year: {
        name: 'Year',
        visible: true,
        format: (lhcPeriod) => extractPeriodYear(lhcPeriod),
    },

    avgEnergy: {
        name: 'Mean energy [GeV]',
        visible: true,
        format: (lhcPeriod) => `${Number(lhcPeriod.avgEnergy).toFixed(2)}`,
    },

    distinctEnergies: {
        name: h('.center-of-mass-energy'),
        visible: true,
        format: (lhcPeriod) =>
            h('', lhcPeriod.distinctEnergies.map((e) => getClosestDefinedEnergy(e, acceptableEnergyValues, acceptableEnergyMargin))
                .filter((value, index, array) => array.indexOf(value) === index)
                .reduce((toDisplay, currentValue) => `${toDisplay ? `${toDisplay}, ` : ''}${currentValue}`, '')),
    },
};
