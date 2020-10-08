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

const Joi = require('@hapi/joi');

const BodyDto = Joi.object({
    timeO2Start: Joi.date(),
    timeTrgStart: Joi.date(),
    activityId: Joi.string(),
    runType: Joi.string()
        .valid('physics', 'cosmics', 'technical'),
    runQuality: Joi.string()
        .valid('good','bad','unknown'),
    nDetectors: Joi.number(),
    nFlps: Joi.number(),
    nEpns: Joi.number(),
    nSubTimeFrames: Joi.number(),
    bytesReadOut: Joi.number(),
    runNumber: Joi.number(),
});

const QueryDto = Joi.object({
    token: Joi.string(),
});

const StartRunDto = Joi.object({
    query: QueryDto,
    body: BodyDto,
    params: Joi.object({}),
});

module.exports = StartRunDto;
