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
const { validateRange, RANGE_INVALID } = require('../../../utilities/rangeUtils');
const { validateTimeDuration } = require('../../../utilities/validateTime');

exports.LhcFillsFilterDto = Joi.object({
    hasStableBeams: Joi.boolean(),
    fillNumbers: Joi.string().trim().custom(validateRange).messages({
        [RANGE_INVALID]: '{{#message}}',
        'string.base': 'Fill numbers must be comma-separated numbers or ranges (e.g. 12,15-18)',
    }),
    runDuration: validateTimeDuration,
    beamDuration: validateTimeDuration,
    beamType: Joi.string(),
    schemeName: Joi.string().trim(),
});
