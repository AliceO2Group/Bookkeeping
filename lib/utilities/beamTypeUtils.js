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

export const BEAM_TYPE_INVALID = 'beamType.invalid';

/**
 * Validates beam types to have correct format
 * Expects a string containing comma separated values.
 *
 * @param {string} value Beam types string to validate
 * @param {*} helpers The helpers object
 * @returns {string} The value if validation passes
 */
export const validateBeamTypes = (value, helpers) => {
    const beamTypes = value.split(',');

    for (const type of beamTypes) {
        // Max length accepted is 15 characters including spaces (e.g. "PROTON - PROTON")
        if (type.length > 15) {
            return helpers.error(BEAM_TYPE_INVALID, {
                message: `Beam type exceeds max length of 15 characters: ${type}`,
            });
        }

        /*
         * Accepts combinations of letters and numbers separated by a hyphen, with optional spaces
         * around the hyphen (e.g. "PROTON-PROTON", "PROTON - PROTON", "P1-P2")
         */
        if (!/^[A-Za-z0-9]+ ?- ?[A-Za-z0-9]+$/.test(type)) {
            return helpers.error(BEAM_TYPE_INVALID, {
                message: `Invalid beam type format: ${type}`,
            });
        }
    }

    return value;
};
