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
const PaginationDto = require('./PaginationDto');
const { CustomJoi } = require('./CustomJoi.js');
const { TagsFilterDto } = require('./filters/TagsFilterDto.js');
const { FromToFilterDto } = require('./filters/FromToFilterDto.js');

const RunFilterDto = Joi.object({
    values: CustomJoi.stringArray().items(EntityIdDto).single().required(),
    operation: Joi.string().valid('and', 'or').required(),
});

const FilterDto = Joi.object({
    title: Joi.string().trim(),
    content: Joi.string().trim(),
    author: Joi.string().trim(),
    created: FromToFilterDto,
    tags: TagsFilterDto,
    lhcFills: CustomJoi.stringArray().items(Joi.number()),
    run: RunFilterDto,
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
    runs: Joi.string().valid('asc', 'desc'),
}).xor('id', 'title', 'author', 'createdAt', 'tags', 'runs');

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
