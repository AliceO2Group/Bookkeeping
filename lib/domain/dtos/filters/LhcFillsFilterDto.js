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
const { validateRange } = require('../../../utilities/rangeUtils');
const { validateTime } = require('../../../utilities/validateTime');

exports.LhcFillsFilterDto = Joi.object({
    hasStableBeams: Joi.boolean(),
    fillNumbers: Joi.string().trim().custom(validateRange).messages({
        'any.invalid': '{{#message}}',
    }),
    beamDuration: Joi.string().trim().min(8).max(8).custom(validateTime).messages({
        'any.invalid': '{{#message}}',
    }),
    beamDurationOperator: Joi.string().trim().min(1).max(2),
    runDuration: Joi.string().trim().min(8).max(8).custom(validateTime).messages({
        'any.invalid': '{{#message}}',
    }),
    runDurationOperator: Joi.string().trim().min(1).max(2),
});
