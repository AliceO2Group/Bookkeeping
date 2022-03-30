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
const EntityIdDto = require('./EntityIdDto');

const errorMessage = 'The values should be comma seperated and can only have letters, numbers and these symbols: #?!@$%^&*-';

const BodyDto = Joi.object({
    mattermost: Joi.string()
        .trim()
        .optional()
        .allow('')
        .pattern(new RegExp(/^((\w|\d|[/-])+(,|,\s|$)){1,}$/))
        .message(errorMessage),
    email: Joi.string()
        .trim()
        .optional()
        .allow('')
        .email({ multiple: true }),
});
const QueryDto = Joi.object({
    token: Joi.string(),
});

const UpdateTagDto = Joi.object({
    query: QueryDto,
    body: BodyDto,
    params: Joi.object({
        tagId: EntityIdDto.required(),
    }),
});

module.exports = UpdateTagDto;
