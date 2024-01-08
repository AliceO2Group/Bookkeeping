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
const { SHIFT_TYPES } = require('../../enums/ShiftTypes.js');

const GetShiftDataDto = Joi.object({
    query: {
        token: Joi.string(),
        shiftType: Joi.string().valid(...SHIFT_TYPES).required(),
    },
    body: Joi.object({}),
    params: Joi.object({}),
});

exports.GetShiftDataDto = GetShiftDataDto;
