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
        name: 'name',
        visible: true,
        format: (navigation, period) => [
            h('td.text-ellipsis', period.name),
            h(
                'td',
                linkChip(
                    navigation,
                    ['runs', h('sub', `[${period.runsCount}]`)],
                    buildHref({
                        page: PN.runsPerPeriod,
                        index: period.name,
                        [DRP.itemsPerPage]: navigation.model.userPreferences.itemsPerPage,
                        [DRP.pageNumber]: 1,
                        sorting: '-run_number',
                    }),
                    period.runsCount === 0 ? noRelatedDataClass : '',
                ),

                linkChip(
                    navigation,
                    ['data passes', h('sub', `[${period.dataPassesCount}]`)],
                    buildHref({
                        page: PN.dataPasses,
                        index: period.name,
                        [DRP.itemsPerPage]: navigation.model.userPreferences.itemsPerPage,
                        [DRP.pageNumber]: 1,
                    }),
                    period.dataPassesCount === 0 ? noRelatedDataClass : '',
                ),

                linkChip(
                    navigation,
                    ['MC', h('sub', `[${period.simulationPassesCount}]`)],
                    buildHref({
                        page: PN.mc,
                        index: period.name,
                        [DRP.itemsPerPage]: navigation.model.userPreferences.itemsPerPage,
                        [DRP.pageNumber]: 1,
                    }),
                    period.simulationPassesCount === 0 ? noRelatedDataClass : '',
                ),
            ),
        ],
    },

    beamType: {
        name: 'beamType',
        visible: true,
        format: (_, period) => period.beamType,
    },

    year: {
        name: 'year',
        visible: true,
        format: (_, period) => extractPeriodYear(period),
    },

    avgEnergy: {
        name: 'avgEnergy',
        visible: true,
        format: (_, period) => `${Number(period.avgEnergy).toFixed(2)}`,
    },

    distinctEnergies: {
        name: h('.center-of-mass-energy'),
        visible: true,
        format: (_, period) =>
            h('', period.distinctEnergies.map((e) => getClosestDefinedEnergy(e, acceptableEnergyValues, acceptableEnergyMargin))
                .filter((value, index, array) => array.indexOf(value) === index)
                .reduce((toDisplay, currentValue) => `${toDisplay ? `${toDisplay}, ` : ''}${currentValue}`, '')),
    },
};
