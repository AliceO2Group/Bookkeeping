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

const distinctEnergiesProcessingConfiguration = {
    values: {
        450: 450,
        6800: 6800,
        7000: 7000,
        '5360/2': 2680,
    },
    acceptableEnergyMargin: 0.01,
};

/**
 * Transform list of given energies.
 * If some energy is within `acceptableMaring` range from one in list `definedEnergies` it is replaced by it
 * @param {number[]} energy list of energies to be transformed
 * @param {object<string, number>} definedEnergies list of typcial energy levels
 * @param {number} acceptableMargin minimal energy difference to keep its original value
 * @returns {number[]} transformed energies list
 */
export const getClosestDefinedEnergy = (energy, definedEnergies, acceptableMargin) => {
    const definedEnergyValues = Object.values(definedEnergies);
    const closest = definedEnergyValues.reduce(
        (acc, current) => Math.abs(current - energy) < Math.abs(acc - energy) ? current : acc,
        definedEnergyValues[0],
    );
    return Math.abs(closest - energy) <= acceptableMargin
        ? Object.keys(definedEnergies).find((key) => definedEnergies[key] === closest)
        : energy.toString();
};

/**
 * List of active columns for a generic periods table
 */
export const lhcPeriodsActiveColumns = {
    name: {
        name: 'Name',
        visible: true,
    },

    avgCenterOfMassEnergy: {
        name: ['Avg ', h('.center-of-mass-energy'), ' [GeV]'],
        visible: true,
        format: (avgCenterOfMassEnergy) => avgCenterOfMassEnergy ? `${Number(avgCenterOfMassEnergy).toFixed(2)}` : '-',
    },

    distinctEnergies: {
        name: ['Distinct Beam Energies [GeV]'],
        visible: true,
        balloon: true,
        format: (distinctEnergies) =>
            distinctEnergies?.length > 0
                ? h('', distinctEnergies
                    ?.map((energy) =>
                        getClosestDefinedEnergy(
                            energy,
                            distinctEnergiesProcessingConfiguration.values,
                            distinctEnergiesProcessingConfiguration.acceptableEnergyMargin,
                        ))
                    .filter((value, index, array) => array.indexOf(value) === index)
                    .map((energy) => Number(energy).toFixed(2))
                    .sort()
                    .join(', '))
                : '-',
    },
};
