/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const Joi = require('joi');
const { CustomJoi } = require('../CustomJoi.js');

/**
 * @typedef {string[]} BeamTypesDto
 * @description An array of beam types, each represented as a string.
 * Each beam type must be a string with a minimum length of 3 characters and a maximum length of 15 characters.
 * The string must match patterns such as "PROTON - PROTON", "NE10 - NE10", where the two parts are separated by a hyphen and optional spaces.
 *
 * RUN3 has the following beam types:
 * "PROTON - PROTON"
 * "NE10 - NE10"
 * "O8 - O8"
 * "PB82 - PB82"
 * "PROTON - O8"
 * "PROTON - PROTON"
 *
 * @example
 * const beamTypes = ["PROTON - PROTON", "NE10 - NE10"];
 */
exports.BeamTypesDto = CustomJoi.stringArray()
    .items(Joi.string()
        .trim()
        .min(3)
        .max(15)
        .pattern(/^[A-Za-z0-9]+ ?- ?[A-Za-z0-9]+$/)
        .messages({
            'string.base': 'Beam type must be a string',
            'string.min': 'Beam type must be at least 2 characters long',
            'string.max': 'Beam type must be at most 15 characters long',
            'string.pattern.base': 'Beam type must look like "PROTON - PROTON", "NE10 - NE10", etc.',
        }));
