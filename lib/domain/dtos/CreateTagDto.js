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
    text: Joi.string()
        .required()
        .pattern(/[\w|\-+]{1,}/)
        .message('"body.text" Text can only include words, digits and "-+"')
        .min(2)
        .max(20),
    description: Joi.string()
        .max(100)
        .optional()
        .allow('', null),
    mattermost: Joi.string()
        .optional()
        .allow('', null),
    email: Joi.string()
        .trim()
        .optional()
        .allow('', null)
        .email({ multiple: true }),
    color: Joi.string()
        .trim()
        .optional()
        .allow(null)
        .min(6)
        .max(6),

});

const QueryDto = Joi.object({
    token: Joi.string(),
});

const CreateTagDto = Joi.object({
    query: QueryDto,
    body: BodyDto,
    params: Joi.object({}),
});

module.exports = CreateTagDto;
