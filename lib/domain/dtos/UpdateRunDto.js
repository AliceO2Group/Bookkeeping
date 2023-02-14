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
const { RUN_DETECTOR_QUALITIES } = require('../enums/RunDetectorQualities.js');
const EntityIdDto = require('./EntityIdDto');
const { RUN_QUALITIES } = require('../enums/RunQualities.js');

const DetectorDto = Joi.object({
    detectorId: EntityIdDto.required(),
    quality: Joi.string().valid(...RUN_DETECTOR_QUALITIES).required(),
});

const EorReasonDto = Joi.object({
    description: Joi.string().allow(null, '').optional(),
    lastEditedName: Joi.string().required(),
    runId: EntityIdDto.required(),
    reasonTypeId: EntityIdDto.required(),
    id: EntityIdDto.optional(),
    category: Joi.string().optional(),
    createdAt: Joi.date().timestamp().optional(),
    title: Joi.string().allow(null, '').optional(),
    updatedAt: Joi.date().timestamp().optional(),
});

const BodyDto = Joi.object({
    runQuality: Joi.string().valid(...RUN_QUALITIES).optional(),
    eorReasons: Joi.array().min(0).items(EorReasonDto).optional(),
    tags: Joi.array()
        .optional()
        .items(Joi.string()),
    detectorsQualities: Joi.array().items(DetectorDto).optional(),
});

const QueryDto = Joi.object({
    token: Joi.string(),
});

const ParamsDto = Joi.object({
    runId: EntityIdDto.required(),
});

const UpdateRunDto = Joi.object({
    query: QueryDto,
    body: BodyDto,
    params: ParamsDto,
});

module.exports = UpdateRunDto;
