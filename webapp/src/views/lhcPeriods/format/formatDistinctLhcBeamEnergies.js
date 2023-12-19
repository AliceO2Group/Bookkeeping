/* eslint-disable require-jsdoc */
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

import { h } from '@aliceo2/web-ui-frontend';

const WELL_DEFINED_ENERGY_LEVELS = [450, 2680, 6800, 7000]; // It is required to be SORTED in ascending order!
const ENERGY_LEVELS_CUSTOM_NAME = { 2680: '5360/2' };
const ENERGY_LEVEL_MARGIN = 0.01;
const DISPLAY_PRECISION = 2;

/**
 * If the energy is close enough (within a given margin @see ENERGY_LEVEL_MARGIN )
 * to a well defined energy level @see WELL_DEFINED_ENERGY_LEVELS , returns the well defined energy level,
 * if not returns null.
 * @param {number} lhcBeamEnergy run's lhc beam energy
 * @return {number|null} well defined energy level or null if there is no one
 */
function getClosestEnergyLevel(lhcBeamEnergy) {
    for (const energyLevel of WELL_DEFINED_ENERGY_LEVELS) {
        if (lhcBeamEnergy < energyLevel - ENERGY_LEVEL_MARGIN) {
            return null;
        } else if (lhcBeamEnergy <= energyLevel + ENERGY_LEVEL_MARGIN) {
            return energyLevel;
        }
    }
    return null;
}

/**
 * Display a given LHC beam energy
 *
 * If the energy is close enough (within a given margin)
 * to a well defined energy level, displays the well defined energy level instead
 *
 * @param {number} lhcBeamEnergy the energy to display
 * @return {string} the energy display
 */
const displayLhcBeamEnergy = (lhcBeamEnergy) => {
    const energyLevel = getClosestEnergyLevel(lhcBeamEnergy);
    const energyToDisplay = energyLevel !== null ? energyLevel : lhcBeamEnergy;
    return energyToDisplay in ENERGY_LEVELS_CUSTOM_NAME
        ? ENERGY_LEVELS_CUSTOM_NAME[energyToDisplay]
        : energyToDisplay.toFixed(DISPLAY_PRECISION);
};

/**
 * Format lhc beam distinct energies, optionaly replacing some of them
 * by well defined energy levels @see displayLhcBeamEnergy
 * @param {number[]} distinctEnergies list of energies to be displayed
 * @returns {Component} formatted list of distinct energies
 */
export const formatDistinctLhcBeamEnergies = (distinctEnergies) =>
    distinctEnergies.length > 0
        ? h('', Array.from(new Set(distinctEnergies
            .map(displayLhcBeamEnergy)))
            .sort((a, b) => a - b)
            .join(', '))
        : '-';
