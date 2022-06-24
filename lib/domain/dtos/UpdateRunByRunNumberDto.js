/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */
const Joi = require('joi');

const BodyDto = Joi.object({
    runQuality: Joi.string().valid('good', 'bad', 'test').default('test').optional(),
    lhcBeamEnergy: Joi.number().optional(),
    lhcBeamMode: Joi.string().max(32).optional(),
    lhcBetaStar: Joi.number().optional(),
    aliceL3Current: Joi.number().optional(),
    aliceDipoleCurrent: Joi.number().optional(),
    fillNumber: Joi.number().optional(),
    aliceL3Polarity: Joi.string().optional().uppercase(),
    aliceDipolePolarity: Joi.string().optional().uppercase(),
});

const QueryDto = Joi.object({
    token: Joi.string(),
    runNumber: Joi.number(),
});

const UpdateRunDto = Joi.object({
    params: Joi.object({}),
    query: QueryDto,
    body: BodyDto,
});

module.exports = UpdateRunDto;
