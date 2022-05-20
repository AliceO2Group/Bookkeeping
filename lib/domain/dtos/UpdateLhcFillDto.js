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
const Joi = require('joi');

const BodyDto = Joi.object({
    stableBeamsStart: Joi.date().optional(),
    stableBeamsEnd: Joi.date().optional(),
    stableBeamsDuration: Joi.number().optional(),
    beamType: Joi.string().valid('p-p', 'p-Pb', 'Pb-Pb').optional(),
    fillingSchemeName: Joi.string().optional(),
});

const ParamsDto = Joi.object({
    fillNumber: Joi.number().required(),
});
const QueryDto = Joi.object({
    token: Joi.string(),
});

const UpdateLhcFillDto = Joi.object({
    query: QueryDto,
    body: BodyDto,
    params: ParamsDto,
});

module.exports = UpdateLhcFillDto;
