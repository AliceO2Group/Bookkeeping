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
const EntityIdDto = require('./EntityIdDto');

const BodyDto = Joi.object({
    title: Joi.string()
        .required()
        .min(3)
        .max(140),
    text: Joi.string()
        .required()
        .min(3),
    rootLogId: EntityIdDto.optional(),
    parentLogId: EntityIdDto.optional(),
});

const QueryDto = Joi.object({
    token: Joi.string(),
});

const CreateLogDto = Joi.object({
    query: QueryDto,
    body: BodyDto,
    params: Joi.object({}),
});

module.exports = CreateLogDto;
