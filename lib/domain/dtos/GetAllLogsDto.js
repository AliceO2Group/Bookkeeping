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

const CreatedFilterDto = Joi.object({
    from: Joi.date().max(new Date().setHours(0, 0, 0, 0)),
    to: Joi.date().max(new Date().setHours(23, 59, 59, 999)).when('from', {
        is: Joi.exist(),
        then: Joi.date().min(Joi.ref('from')),
    }),
});

const TagFilterDto = Joi.object({
    values: customJoi.stringArray().items(EntityIdDto).single().required(),
    operation: Joi.string().valid('and', 'or').required(),
});

const FilterDto = Joi.object({
    origin: Joi.string()
        .valid('human', 'process'),
    parentLog: EntityIdDto,
    rootLog: EntityIdDto,
    created: CreatedFilterDto,
    tag: TagFilterDto,
});

const SortDto = Joi.object({
    id: Joi.string()
        .valid('asc', 'desc'),
    text: Joi.string()
        .valid('asc', 'desc'),
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
