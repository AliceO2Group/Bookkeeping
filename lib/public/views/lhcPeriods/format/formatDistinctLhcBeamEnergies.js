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
    wellDefinedEnergyLevelToDisplay: {
        450: 450,
        6800: 6800,
        7000: 7000,
        2680: '5360/2',
    },
    acceptableEnergyMargin: 0.01,
};

/**
 * Get closest energy from given list to given lhcBeamEnergy
 * @param {number} lhcBeamEnergy lhc beam energy
 * @param {number[]} wellDefinedEnergyLevels list of energy levels
 * @returns {number} closest energy
 */
export const getClosestDefinedEnergyLevel =
    (lhcBeamEnergy, wellDefinedEnergyLevels) => {
        const definedEnergyValues = Object.keys(wellDefinedEnergyLevels);
        const closestEnergyLevel = definedEnergyValues.reduce(
            (acc, current) => Math.abs(current - lhcBeamEnergy) < Math.abs(acc - lhcBeamEnergy) ? current : acc,
            definedEnergyValues[0],
        );
        return closestEnergyLevel;
    };

/**
 * Get displayable value of distinct lhc beam energy
 * @param {number} lhcBeamEnergy list of energies to be transformed
 * @param {number} closestEnergyLevel closest found energy level to lhcBeamEnergy
 * @param {object<string, number>} wellDefinedEnergyLevels mapping { ACTUAL_NUMERIC_VALUE -> DISPLAYABLE_VALUE }
 * @param {number} acceptableEnergyMargin minimal energy difference to keep lhcBeamEnergy as is
 * @param {number} notChangedEnergyPrecision number of significant decimal places
 * @returns {string} lhcBeamEnergy or closest energy in displayable format
 */
const _distinctLhcBeamEnergyToDisplay =
    (lhcBeamEnergy, closestEnergyLevel, wellDefinedEnergyLevels, acceptableEnergyMargin, notChangedEnergyPrecision = 2) =>
        Math.abs(closestEnergyLevel - lhcBeamEnergy) <= acceptableEnergyMargin
            ? wellDefinedEnergyLevels(closestEnergyLevel)
            : lhcBeamEnergy.toFixed(notChangedEnergyPrecision).toString();

/**
 * Takes lhcBeamEnergy and return it or closest defined energy accoriding to the following conditions.
 *
 *      If consider all energies `E DEFINED IN wellDefinedEnergyLevels`
 *      and take minimal absolute value of difference of lhcBeamEnergy and E
 *      and `|lhcBeamEnergy - closestEnergy| <= acceptableMargin`
 *      then the function returns `closestEnergy`
 *      if there is no `closestEnergy` fulfilling all requirements then the function returns `lhcBeamEnergy`.
 *
 * @param {number} lhcBeamEnergy list of energies to be transformed
 * @returns {string} closest energy in displayable format
 */
const distinctLhcBeamEnergyToDisplay = (lhcBeamEnergy) => {
    const closestEnergy = getClosestDefinedEnergyLevel(
        lhcBeamEnergy,
        Object.keys(distinctEnergiesProcessingConfiguration.wellDefinedEnergyLevelToDisplay),
    );
    return _distinctLhcBeamEnergyToDisplay(
        lhcBeamEnergy,
        closestEnergy,
        distinctEnergiesProcessingConfiguration.wellDefinedEnergyLevelToDisplay,
        distinctEnergiesProcessingConfiguration.acceptableEnergyMargin,
    );
};

/**
 * Format lhc beam distinct energies, optionaly replacing some by closest energies
 * @param {number[]} distinctEnergies list of energies to be transformed
 * @returns {Component} list of distinct energies
 */
export const formatDistinctLhcBeamEnergies = (distinctEnergies) =>
    distinctEnergies?.length > 0
        ? h('', distinctEnergies
            ?.map(distinctLhcBeamEnergyToDisplay)
            .filter((value, index, array) => array.indexOf(value) === index) // Unique
            .join(', '))
        : '-';
