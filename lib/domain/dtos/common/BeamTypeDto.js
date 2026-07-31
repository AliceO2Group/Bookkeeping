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
const { BEAM_TYPE_INVALID } = require('../../../utilities/beamTypeUtils');

exports.BeamTypesDto = CustomJoi.stringArray()
    .items(Joi.string()
        .trim()
        .min(2)
        .max(15)
        .pattern(/^[A-Za-z0-9]+ ?- ?[A-Za-z0-9]+$/)
        .messages({
            [BEAM_TYPE_INVALID]: '{{#message}}',
            'string.base': 'Beam type must be a string',
        }));
