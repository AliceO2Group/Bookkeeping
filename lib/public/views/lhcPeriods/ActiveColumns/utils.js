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

const PERIOD_NAME_REGEX = /^LHC\d\d[a-zA-Z]+/;

/**
 * TODO docs
 * Get closets energy to given one
 * @param {number} energy run energy
 * @param {number[]} [closestEnergiesConfiguraion.definedEnergies] list defined energies
 * @param {number[]} [closestEnergiesConfiguraion.acceptableMargin] marging
 * @returns {number} energy
 */
export const getClosestDefinedEnergy = (energy, { definedEnergies, acceptableMargin }) => {
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
 * Extract year from lhc period name
 * @param {string} lhcPeriodName name of lhc period
 * @returns {number|null} year, null if lhcPeriod is not valid
 */
export const extractPeriodYear = (lhcPeriodName) => PERIOD_NAME_REGEX.test(lhcPeriodName)
    ? 2000 + parseInt(lhcPeriodName.slice(3, 5), 10)
    : null;
