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

const distinctEnergiesProcessingConfiguration = { // FOR NOW HARDCODED
    wellDefinedEnergyLevels: {
        450: 450,
        6800: 6800,
        7000: 7000,
        '5360/2': 2680,
    },
    acceptableEnergyMargin: 0.01,
};

/**
 * Takes lhcBeamEnergy and return it or closest defined energy accoriding to the following conditions.
 *
 *      If consider all energies `E DEFINED IN wellDefinedEnergyLevels`
 *      and take minimal absolute value of difference of lhcBeamEnergy and E
 *      and `|lhcBeamEnergy - closestEnergy| < acceptableMargin`
 *      then the function returns `closestEnergy`
 *      if there is no `closestEnergy` fulfilling all requirements then the function returns `lhcBeamEnergy`.
 *
 * @param {number} lhcBeamEnergy list of energies to be transformed
 * @param {object<string, number>} wellDefinedEnergyLevels mapping { DISPLAYABLE_VALUE -> ACTUAL_NUMERIC_VALUE }
 * @param {number} acceptableEnergyMargin minimal energy difference to keep lhcBeamEnergy as is
 * @param {number} notChangedEnergyPrecision number of significant decimal places
 * @returns {string} lhcBeamEnergy or closest energy in displayable format
 */
export const getClosestDefinedEnergy = (lhcBeamEnergy, wellDefinedEnergyLevels, acceptableEnergyMargin, notChangedEnergyPrecision = 2) => {
    const definedEnergyValues = Object.values(wellDefinedEnergyLevels);
    const closest = definedEnergyValues.reduce(
        (acc, current) => Math.abs(current - lhcBeamEnergy) < Math.abs(acc - lhcBeamEnergy) ? current : acc,
        definedEnergyValues[0],
    );
    return Math.abs(closest - lhcBeamEnergy) <= acceptableEnergyMargin
        ? Object.keys(wellDefinedEnergyLevels).find((key) => wellDefinedEnergyLevels[key] === closest)
        : lhcBeamEnergy.toFixed(notChangedEnergyPrecision).toString();
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
                            distinctEnergiesProcessingConfiguration.wellDefinedEnergyLevels,
                            distinctEnergiesProcessingConfiguration.acceptableEnergyMargin,
                        ))
                    .filter((value, index, array) => array.indexOf(value) === index)
                    .join(', '))
                : '-',
    },
};
