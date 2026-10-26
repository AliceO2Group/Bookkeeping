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

/**
 * Families of beam types, depending on what collides. Lead-lead collisions have their own family as they are the main ones of ALICE
 *
 * @enum {string}
 */
export const BeamTypeFamilies = Object.freeze({
    LEAD_LEAD: 'lead-lead',
    PROTON_PROTON: 'proton-proton',
    PROTON_ION: 'proton-ion',
    ION_ION: 'ion-ion',
    UNKNOWN: 'unknown',
});

const PROTON_NAMES = ['p', 'proton'];
const LEAD_NAMES = ['pb', 'pb82'];

/**
 * Returns the family of the given beam type, depending on what collides in it
 *
 * @param {string|null} beamType the beam type as sent by the LHC (e.g. `p-p`, `PROTON-PROTON`, `p-Pb`, `Pb-Pb`)
 * @return {BeamTypeFamilies} the family of the beam type
 */
export const getBeamTypeFamily = (beamType) => {
    const beams = beamType?.split('-').map((beam) => beam.trim().toLowerCase()) ?? [];
    if (beams.length !== 2 || beams.some((beam) => beam === '')) {
        return BeamTypeFamilies.UNKNOWN;
    }

    if (beams.every((beam) => LEAD_NAMES.includes(beam))) {
        return BeamTypeFamilies.LEAD_LEAD;
    }

    const protonsCount = beams.filter((beam) => PROTON_NAMES.includes(beam)).length;
    return [BeamTypeFamilies.ION_ION, BeamTypeFamilies.PROTON_ION, BeamTypeFamilies.PROTON_PROTON][protonsCount];
};
