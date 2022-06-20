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

const customDateFilterErrorMessages = {
    'date.base': 'Creation date must be a real date and in format YYYY-MM-DD or YYYY/MM/DD',
};
const customJoi = Joi.extend((joi) => ({
    base: joi.array(),
    type: 'stringArray',
    coerce: (value) => ({ value: value.split ? value.split(',') : value }),
}));
const DateFilterDto = Joi.object({
    from: Joi.date()
        .messages(customDateFilterErrorMessages),
    to: Joi.date()
        .messages(customDateFilterErrorMessages),
});

const TagFilterDto = Joi.object({
    values: customJoi.stringArray().items(EntityIdDto).single().required(),
    operation: Joi.string().valid('and', 'or').required(),
});

const SortDto = Joi.object({
    id: Joi.string()
        .valid('asc', 'desc'),
    text: Joi.string()
        .valid('asc', 'desc'),
});

const AmountOperatorComparisonDto = Joi.object({
    operator: Joi.string().valid('<', '<=', '=', '>=', '>'),
    limit: Joi.number().integer().min(0),
});

const FilterDto = Joi.object({
    runNumbers: Joi.string().trim(),
    tag: TagFilterDto,
    o2start: DateFilterDto,
    o2end: DateFilterDto,
    trgStart: DateFilterDto,
    trgEnd: DateFilterDto,
    runDuration: AmountOperatorComparisonDto,
    environmentIds: Joi.string().trim(),
    runQualities: customJoi.stringArray().items(Joi.string().trim().valid('good', 'bad', 'test')),
    nDetectors: AmountOperatorComparisonDto,
    nFlps: AmountOperatorComparisonDto,
    ddflp: Joi.boolean(),
    dcs: Joi.boolean(),
    epn: Joi.boolean(),
    epnTopology: Joi.string().trim(),
    detectors: Joi.string().trim(),
});

const QueryDto = Joi.object({
    filter: FilterDto,
    page: PaginationDto,
    sort: SortDto,
    token: Joi.string(),
});

const GetAllRunsDto = Joi.object({
    body: Joi.object({}),
    params: Joi.object({}),
    query: QueryDto,
});

module.exports = GetAllRunsDto;
