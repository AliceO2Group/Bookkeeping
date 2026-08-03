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
 * Used by Bookkeeping-LHC Plugin to send data as per LHC
 */
const DASH_SEPARATED_BEAM_TYPE_PATTERN = /^[A-Za-z0-9]{1,6} ?- ?[A-Za-z0-9]{1,6}$/;

/**
 * User Input format declared by user at deployment of environment
 */
const COMPACT_BEAM_TYPE_PATTERN = /^[A-Za-z]{2,15}$/;

const BEAM_TYPE_MIN_LENGTH = 5;
const BEAM_TYPE_MAX_LENGTH = 15;
const PDP_BEAM_TYPE_MIN_LENGTH = 2;
const PDP_BEAM_TYPE_MAX_LENGTH = 10;

/**
 * @typedef {string[]} BeamTypesDto
 * @description An array of beam types, each represented as a string.
 * Each beam type must be a string with a minimum length of 2 characters and a maximum length of 15 characters.
 * The string must match patterns such as "PROTON - PROTON", "NE10 - NE10", where the two parts are separated by a hyphen and optional spaces.
 *
 * RUN3 has the following beam types:
 * "PROTON - PROTON"
 * "NE10 - NE10"
 * "O8 - O8"
 * "PB82 - PB82"
 * "PROTON - O8"
 *
 * RUN3 has the following compact beam types:
 * "pp"
 * "pPb"
 * "NeNe"
 * "OO"
 * "cosmic"
 * "technical"
 *
 * @example
 * const beamTypes = ["PROTON - PROTON", "NE10 - NE10"];
 */
exports.BeamTypesDto = CustomJoi.stringArray()
    .items(Joi.string()
        .trim()
        .min(BEAM_TYPE_MIN_LENGTH)
        .max(BEAM_TYPE_MAX_LENGTH)
        .pattern(DASH_SEPARATED_BEAM_TYPE_PATTERN)
        .messages({
            'string.base': 'Beam type must be a string',
            'string.min': `Beam type must be at least ${BEAM_TYPE_MIN_LENGTH} characters long`,
            'string.max': `Beam type must be at most ${BEAM_TYPE_MAX_LENGTH} characters long`,
            'string.pattern.base': 'Beam type must look like "PROTON - PROTON", "NE10 - NE10", etc.',
        }));

/**
 * @typedef {string[]} PdpBeamTypesDto
 * @description An array of compact PDP beam types represented as strings.
 * Values can include examples like "pp", "pPb", "NeNe", "OO", "cosmic", and "technical".
 */
exports.PdpBeamTypesDto = CustomJoi.stringArray()
    .items(Joi.string()
        .trim()
        .min(PDP_BEAM_TYPE_MIN_LENGTH)
        .max(PDP_BEAM_TYPE_MAX_LENGTH)
        .pattern(COMPACT_BEAM_TYPE_PATTERN)
        .messages({
            'string.base': 'PDP beam type must be a string',
            'string.min': `PDP beam type must be at least ${PDP_BEAM_TYPE_MIN_LENGTH} characters long`,
            'string.max': `PDP beam type must be at most ${PDP_BEAM_TYPE_MAX_LENGTH} characters long`,
            'string.pattern.base': 'PDP beam type must look like "pp", "pPb", "NeNe", "OO", "cosmic", "technical", etc.',
        }));
