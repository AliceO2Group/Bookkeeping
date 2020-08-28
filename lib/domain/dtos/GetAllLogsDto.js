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
const PaginationDto = require('./PaginationDto');

const customJoi = Joi.extend((joi) => ({
    base: joi.array(),
    type: 'stringArray',
    coerce: (value) => ({ value: value.split ? value.split(',') : value }),
}));

const customDateFilterErrorMessages = {
    'date.base': 'Creation date must be a real date and in format YYYY-MM-DD or YYYY/MM/DD',
    'date.max': 'Creation date must be today ({#limit}) or earlier',
    'date.min': 'Creation date "to" cannot be before the "from" date',
};
const CreatedFilterDto = Joi.object({
    from: Joi.date()
        .max(new Date().setHours(0, 0, 0, 0))
        .messages(customDateFilterErrorMessages),
    to: Joi.date()
        .max(new Date().setHours(23, 59, 59, 999))
        .when('from', {
            is: Joi.exist(),
            then: Joi.date().min(Joi.ref('from')),
        })
        .messages(customDateFilterErrorMessages),
});

const TagFilterDto = Joi.object({
    values: customJoi.stringArray().items(EntityIdDto).single().required(),
    operation: Joi.string().valid('and', 'or').required(),
});

const FilterDto = Joi.object({
    title: Joi.string().trim(),
    author: Joi.string().trim(),
    created: CreatedFilterDto,
    tag: TagFilterDto,
    origin: Joi.string()
        .valid('human', 'process'),
    parentLog: EntityIdDto,
    rootLog: EntityIdDto,
});

const SortDto = Joi.object({
    id: Joi.string().valid('asc', 'desc'),
    title: Joi.string().valid('asc', 'desc'),
    author: Joi.string().valid('asc', 'desc'),
    createdAt: Joi.string().valid('asc', 'desc'),
    tags: Joi.string().valid('asc', 'desc'),
});

const QueryDto = Joi.object({
    filter: FilterDto,
    page: PaginationDto,
    sort: SortDto,
    token: Joi.string(),
});

const GetAllLogsDto = Joi.object({
    body: Joi.object({}),
    params: Joi.object({}),
    query: QueryDto,
});

module.exports = GetAllLogsDto;
