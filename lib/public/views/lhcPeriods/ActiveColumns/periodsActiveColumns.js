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
import linkChip from '../../../components/chips/linkChip.js';
import { RCT } from '../../../config.js';
import { getClosestDefinedEnergy } from '../../../utils/dataProcessing/dataProcessingUtils.js';
import { buildHref } from '../../../utils/url/urlUtils.js';
const { dataReqParams: DRP, pageNames: PN, fieldNames: FN } = RCT;
const acceptableEnergyValues = RCT.mapping.energy.values;
const acceptableEnergyMargin = RCT.mapping.energy.acceptableMargin;
const fieldNames = FN.periods;

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
        header: fieldNames.name.fieldName,
        fieldName: fieldNames.name.fieldName,
        filterInput: fieldNames.name.filterInput,
        format: (navigation, period) => [
            h('td.text-ellipsis', period.name),
            h('td',
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
                )),
        ],
    },

    beamType: {
        name: 'beamType',
        visible: true,
        header: fieldNames.beamType.fieldName,
        fieldName: fieldNames.beamType.fieldName,
        filterInput: fieldNames.beamType.filterInput,
        format: (_, period) => period.beamType,
    },

    year: {
        name: 'year',
        visible: true,
        header: fieldNames.year.fieldName,
        fieldName: fieldNames.year.fieldName,
        filterInput: fieldNames.year.filterInput,
        format: (_, period) => period.year,
    },

    avgEnergy: {
        name: 'avgEnergy',
        visible: true,
        header: fieldNames.avgEnergy.fieldName,
        fieldName: fieldNames.avgEnergy.fieldName,
        filterInput: fieldNames.avgEnergy.filterInput,
        format: (_, period) => `${Number(period.avgEnergy).toFixed(2)}`,
    },

    distinctEnergies: {
        name: 'distinctEnergies',
        visible: true,
        header: h('.center-of-mass-energy'),
        fieldName: fieldNames.distinctEnergies.fieldName,
        filterInput: fieldNames.distinctEnergies.filterInput,
        format: (_, period) =>
            h('', period.distinctEnergies.map((e) => getClosestDefinedEnergy(e, acceptableEnergyValues, acceptableEnergyMargin))
                .filter((value, index, array) => array.indexOf(value) === index)
                .reduce((toDisplay, currentValue) => `${toDisplay ? `${toDisplay}, ` : ''}${currentValue}`, '')),
    },
};
